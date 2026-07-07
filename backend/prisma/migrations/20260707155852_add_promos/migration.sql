-- AlterTable
ALTER TABLE `sales` ADD COLUMN `discount_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `promo_id` INTEGER NULL,
    ADD COLUMN `subtotal` DECIMAL(12, 2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `promos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `discount_type` ENUM('PERCENT', 'FIXED') NOT NULL,
    `discount_value` DECIMAL(12, 2) NOT NULL,
    `min_purchase` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `apply_type` ENUM('ALL', 'CATEGORY', 'PRODUCT') NOT NULL DEFAULT 'ALL',
    `category` VARCHAR(191) NULL,
    `product_id` INTEGER NULL,
    `store_id` INTEGER NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `promos_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `promos` ADD CONSTRAINT `promos_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `promos` ADD CONSTRAINT `promos_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sales` ADD CONSTRAINT `sales_promo_id_fkey` FOREIGN KEY (`promo_id`) REFERENCES `promos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
