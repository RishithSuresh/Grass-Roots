const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Lock Contract", function () {
    let lock;
    let owner, user1, user2;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        const Lock = await ethers.getContractFactory("Lock");
        lock = await Lock.deploy(); // ethers v6: deploy() returns deployed instance
    });

    it("Should allow deposits and store correct unlockTime", async function () {
        const unlockTime = (await time.latest()) + 60; // 60 seconds in future
        const depositAmount = ethers.parseEther("1");

        await lock.connect(user1).deposit(user1.address, unlockTime, { value: depositAmount });

        const userLocks = await lock.getLocks(user1.address);
        expect(userLocks.length).to.equal(1);
        expect(userLocks[0].sender).to.equal(user1.address);
        expect(userLocks[0].recipient).to.equal(user1.address);
        expect(userLocks[0].amount.toString()).to.equal(depositAmount.toString());
        expect(userLocks[0].withdrawn).to.equal(false);
    });

    it("Should prevent withdrawal before unlock time", async function () {
        const unlockTime = (await time.latest()) + 60;
        await lock.connect(user1).deposit(user1.address, unlockTime, { value: ethers.parseEther("1") });

        await expect(lock.connect(user1).withdraw(0))
            .to.be.revertedWith("Too early to withdraw");
    });

    it("Should allow withdrawal after unlock time", async function () {
        const unlockTime = (await time.latest()) + 10;
        const depositAmount = ethers.parseEther("1");

        await lock.connect(user1).deposit(user1.address, unlockTime, { value: depositAmount });

        // Fast-forward blockchain time
        await time.increaseTo(unlockTime + 1);

        await expect(lock.connect(user1).withdraw(0))
            .to.emit(lock, "Withdrawn")
            .withArgs(user1.address, depositAmount);

        const userLocks = await lock.getLocks(user1.address);
        expect(userLocks[0].withdrawn).to.equal(true);
    });

    it("Should prevent withdrawal twice", async function () {
        const unlockTime = (await time.latest()) + 10;
        const depositAmount = ethers.parseEther("1");

        await lock.connect(user1).deposit(user1.address, unlockTime, { value: depositAmount });

        await time.increaseTo(unlockTime + 1);
        await lock.connect(user1).withdraw(0);

        await expect(lock.connect(user1).withdraw(0))
            .to.be.revertedWith("Already withdrawn");
    });

    it("Should allow multiple locks per user and independent withdrawals", async function () {
        const depositAmount1 = ethers.parseEther("1");
        const depositAmount2 = ethers.parseEther("2");
        const now = await time.latest();

        await lock.connect(user1).deposit(user1.address, now + 10, { value: depositAmount1 });
        await lock.connect(user1).deposit(user1.address, now + 20, { value: depositAmount2 });

        await time.increaseTo(now + 11);
        await lock.connect(user1).withdraw(0); // Withdraw first lock

        const locks = await lock.getLocks(user1.address);
        expect(locks[0].withdrawn).to.equal(true);
        expect(locks[1].withdrawn).to.equal(false);

        await time.increaseTo(now + 21);
        await lock.connect(user1).withdraw(1); // Withdraw second lock
        const updatedLocks = await lock.getLocks(user1.address);
        expect(updatedLocks[1].withdrawn).to.equal(true);
    });

    it("Should allow sending ETH to another user", async function () {
        const unlockTime = (await time.latest()) + 10;
        const depositAmount = ethers.parseEther("1");

        // user1 sends ETH to user2
        await lock.connect(user1).deposit(user2.address, unlockTime, { value: depositAmount });

        const user2Locks = await lock.getLocks(user2.address);
        expect(user2Locks.length).to.equal(1);
        expect(user2Locks[0].sender).to.equal(user1.address);
        expect(user2Locks[0].recipient).to.equal(user2.address);
        expect(user2Locks[0].amount.toString()).to.equal(depositAmount.toString());

        await time.increaseTo(unlockTime + 1);

        // Only user2 can withdraw
        await expect(lock.connect(user1).withdraw(0))
            .to.be.revertedWith("Invalid lock index");

        await expect(lock.connect(user2).withdraw(0))
            .to.emit(lock, "Withdrawn")
            .withArgs(user2.address, depositAmount);
    });
});
