-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Connector` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `baseUrl` VARCHAR(191) NOT NULL,
    `authType` ENUM('NONE', 'API_KEY', 'BEARER') NOT NULL DEFAULT 'NONE',
    `authConfig` JSON NOT NULL,
    `rateLimitConfig` JSON NOT NULL,
    `endpointConfig` JSON NOT NULL,
    `fieldMappingConfig` JSON NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Connector_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SyncJob` (
    `id` VARCHAR(191) NOT NULL,
    `connectorId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'RUNNING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `logs` JSON NOT NULL,
    `error` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    INDEX `SyncJob_connectorId_idx`(`connectorId`),
    INDEX `SyncJob_userId_idx`(`userId`),
    INDEX `SyncJob_status_idx`(`status`),
    INDEX `SyncJob_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RawApiData` (
    `id` VARCHAR(191) NOT NULL,
    `syncJobId` VARCHAR(191) NOT NULL,
    `endpoint` VARCHAR(191) NOT NULL,
    `response` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RawApiData_syncJobId_idx`(`syncJobId`),
    INDEX `RawApiData_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NormalizedData` (
    `id` VARCHAR(191) NOT NULL,
    `syncJobId` VARCHAR(191) NOT NULL,
    `connectorId` VARCHAR(191) NOT NULL,
    `entityKey` VARCHAR(191) NOT NULL,
    `data` JSON NOT NULL,
    `metadata` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `NormalizedData_syncJobId_idx`(`syncJobId`),
    INDEX `NormalizedData_connectorId_idx`(`connectorId`),
    INDEX `NormalizedData_entityKey_idx`(`entityKey`),
    INDEX `NormalizedData_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Connector` ADD CONSTRAINT `Connector_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SyncJob` ADD CONSTRAINT `SyncJob_connectorId_fkey` FOREIGN KEY (`connectorId`) REFERENCES `Connector`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SyncJob` ADD CONSTRAINT `SyncJob_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RawApiData` ADD CONSTRAINT `RawApiData_syncJobId_fkey` FOREIGN KEY (`syncJobId`) REFERENCES `SyncJob`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NormalizedData` ADD CONSTRAINT `NormalizedData_syncJobId_fkey` FOREIGN KEY (`syncJobId`) REFERENCES `SyncJob`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NormalizedData` ADD CONSTRAINT `NormalizedData_connectorId_fkey` FOREIGN KEY (`connectorId`) REFERENCES `Connector`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
