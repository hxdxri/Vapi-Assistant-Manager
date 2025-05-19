-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Assistant` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `vapiAssistantId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `availabilityJson` JSON NOT NULL,
    `voiceProvider` VARCHAR(191) NOT NULL,
    `languageCode` VARCHAR(191) NOT NULL,
    `introMessage` VARCHAR(191) NOT NULL,
    `webhookUrl` VARCHAR(191) NULL,
    `transcriptionEnabled` BOOLEAN NOT NULL DEFAULT true,
    `recordingEnabled` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Assistant_vapiAssistantId_key`(`vapiAssistantId`),
    INDEX `Assistant_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Assistant` ADD CONSTRAINT `Assistant_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
