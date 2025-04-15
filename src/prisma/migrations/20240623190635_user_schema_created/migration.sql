-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT,
    "userName" TEXT,
    "countryCode" TEXT,
    "phoneNo" TEXT,
    "isPhoneNoVerified" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "dob" TIMESTAMP(3),
    "gender" INTEGER,
    "registeredOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedOn" TIMESTAMP(3) NOT NULL,
    "isBanned" BOOLEAN DEFAULT false,
    "bannedById" INTEGER,
    "bannedReason" TEXT,
    "isTempDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_userName_key" ON "User"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNo_key" ON "User"("phoneNo");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
