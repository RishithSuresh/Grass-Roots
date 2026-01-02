import { useEffect, useState, useCallback } from "react";
import { getProvider, getContract, getRpcProvider } from "./contract";
import { ethers } from "ethers";
import "./App.css";

export default function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0");
  const [locks, setLocks] = useState([]);
  const [amount, setAmount] = useState("1");
  const [unlockDuration, setUnlockDuration] = useState("60");
  const [durationType, setDurationType] = useState("seconds");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const [rpcBlock, setRpcBlock] = useState(null);
  const [mmBlock, setMmBlock] = useState(null);

  // Update current time every second for countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Periodically check RPC and MetaMask provider block numbers to detect divergence
  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const rpc = getRpcProvider();
        const rb = await rpc.getBlockNumber();
        if (mounted) setRpcBlock(rb);
      } catch (e) {
        if (!isTransientRpcError(e.message)) console.error('RPC check failed', e);
        if (mounted) setRpcBlock(null);
      }

      try {
        if (window.ethereum) {
          const browser = new ethers.BrowserProvider(window.ethereum);
          const mb = await browser.getBlockNumber();
          if (mounted) setMmBlock(mb);
        } else {
          if (mounted) setMmBlock(null);
        }
      } catch (e) {
        if (!isTransientRpcError(e.message)) console.error('MetaMask check failed', e);
        if (mounted) setMmBlock(null);
      }
    };
    check();
    const id = setInterval(check, 5000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const isTransientRpcError = (msg) => {
    if (!msg) return false;
    return msg.includes('RPC endpoint returned too many errors') || msg.includes('-32002') || msg.includes('too many errors');
  };

  async function connect() {
    try {
      setLoading(true);
      setError(null);
      const provider = await getProvider();
      const rpc = getRpcProvider();

      // Check network via RPC provider (more reliable than browser provider for network queries)
      const network = await rpc.getNetwork();
      // network.chainId may be a number or bigint depending on provider
      const chainId = typeof network.chainId === "bigint" ? Number(network.chainId) : network.chainId;
      if (chainId !== 31337 && chainId !== 1337) {
        throw new Error("Please connect to Hardhat Local network (Chain ID: 31337)");
      }

      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      const bal = await rpc.getBalance(addr);
      setAccount(addr);
      setBalance(ethers.formatEther(bal));
      showNotification("Wallet connected successfully!", "success");

      // Load locks after connecting
      try {
        // Use RPC provider for read-only calls to avoid MetaMask RPC rate limits
        const rpc = getRpcProvider();
        const contract = await getContract(rpc);
        const userLocks = await contract.getLocks(addr);
        setLocks(userLocks);
      } catch (lockErr) {
        console.error("Failed to load locks:", lockErr);
        const msg = (lockErr && lockErr.message) ? lockErr.message : String(lockErr);
        if (isTransientRpcError(msg)) {
          showNotification('RPC endpoint busy — retrying shortly', 'info');
        } else if (msg.includes("could not decode result data") || msg.includes("No contract code found") || msg.includes("missing revert data") || msg.includes("CALL_EXCEPTION")) {
          showError("Contract not found or call reverted. Ensure Hardhat node is running, contract deployed, and RPC is healthy.");
        } else {
          showError(msg || "Failed to load locks");
        }
      }

      return { provider, signer };
    } catch (err) {
      const msg = (err && err.message) ? err.message : String(err);
      if (isTransientRpcError(msg)) {
        showNotification('RPC endpoint busy — retrying shortly', 'info');
        return;
      }
      showError(msg || "Failed to connect wallet");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  const loadLocks = useCallback(async () => {
    if (!account) return;
    try {
      setLoading(true);
      const provider = await getProvider();
      const rpc = getRpcProvider();
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      const contract = await getContract(rpc);
      const userLocks = await contract.getLocks(addr);
      setLocks(userLocks);

      // Update balance using RPC provider
      const bal = await rpc.getBalance(addr);
      setBalance(ethers.formatEther(bal));
    } catch (err) {
      console.error("Load locks error:", err);
      const msg = (err && err.message) ? err.message : String(err);
      // Don't show error notification here; reset locks and log
      setLocks([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  }, [account]);

  async function deposit() {
    try {
      setLoading(true);
      setError(null);

      if (!amount || parseFloat(amount) <= 0) {
        throw new Error("Please enter a valid amount");
      }

      const { signer } = await connect();
      const contract = await getContract(signer);

      // Lock for yourself (self-to-self transfer)
      const recipientAddress = account;

      // Calculate unlock time based on duration type
      let seconds = Number(unlockDuration);
      if (durationType === "minutes") seconds *= 60;
      else if (durationType === "hours") seconds *= 3600;
      else if (durationType === "days") seconds *= 86400;

      const unlockTime = Math.floor(Date.now() / 1000) + seconds;

      // Contract `deposit` signature expects recipient first then unlockTime
      const tx = await contract.deposit(recipientAddress, unlockTime, {
        value: ethers.parseEther(amount)
      });

      showNotification("Transaction submitted! Waiting for confirmation...", "info");
      await tx.wait();
      showNotification(`Successfully locked ${amount} ETH!`, "success");

      await loadLocks();
      setAmount("1");
    } catch (err) {
      const msg = (err && err.message) ? err.message : String(err);
      if (isTransientRpcError(msg)) {
        showNotification('RPC endpoint busy — retrying shortly', 'info');
      } else if (msg.includes("could not decode result data")) {
        showError("Contract not found. Please ensure Hardhat node is running and contract is deployed.");
      } else {
        showError(msg || "Failed to deposit");
      }
    } finally {
      setLoading(false);
    }
  }

  async function withdraw(index) {
    try {
      setLoading(true);
      setError(null);

      const { signer } = await connect();
      const contract = await getContract(signer);
      const tx = await contract.withdraw(index);

      showNotification("Withdrawal submitted! Waiting for confirmation...", "info");
      await tx.wait();
      showNotification("Successfully withdrawn!", "success");

      await loadLocks();
    } catch (err) {
      const msg = (err && err.message) ? err.message : String(err);
      if (isTransientRpcError(msg)) {
        showNotification('RPC endpoint busy — retrying shortly', 'info');
      } else if (msg.includes("could not decode result data")) {
        showError("Contract not found. Please ensure Hardhat node is running and contract is deployed.");
      } else {
        showError(msg || "Failed to withdraw");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (account) {
      loadLocks();
    }
  }, [account, loadLocks]);

  // Calculate statistics
  const stats = {
    totalLocked: locks.reduce((sum, lock) =>
      !lock.withdrawn ? sum + parseFloat(ethers.formatEther(lock.amount)) : sum, 0
    ),
    totalWithdrawn: locks.reduce((sum, lock) =>
      lock.withdrawn ? sum + parseFloat(ethers.formatEther(lock.amount)) : sum, 0
    ),
    activeLocks: locks.filter(lock => !lock.withdrawn).length,
    completedLocks: locks.filter(lock => lock.withdrawn).length,
  };

  // Format countdown timer
  const formatCountdown = (unlockTime) => {
    const diff = Number(unlockTime) - currentTime;
    if (diff <= 0) return "Unlocked";

    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const formatAddress = (addr) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="app">
      {/* Notification */}
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>×</button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="notification notification-error">
          <span>❌ {error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">🔒</div>
              <h1>TimeLock Vault</h1>
            </div>

            {!account ? (
              <button className="btn btn-primary" onClick={connect} disabled={loading}>
                {loading ? "Connecting..." : "Connect Wallet"}
              </button>
            ) : (
              <div className="wallet-info">
                <div className="wallet-balance">
                  <span className="balance-label">Balance</span>
                  <span className="balance-value">{parseFloat(balance).toFixed(4)} ETH</span>
                </div>
                <div className="wallet-address">
                  <span className="address-icon">👤</span>
                  <span>{formatAddress(account)}</span>
                </div>
                <div className="provider-status">
                  <small>RPC: {rpcBlock === null ? '—' : rpcBlock}</small>
                  <small style={{marginLeft:8}}>MetaMask: {mmBlock === null ? '—' : mmBlock}</small>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {!account ? (
            <div className="welcome-section">
              <div className="welcome-card">
                <div className="welcome-icon">🔐</div>
                <h2>Welcome to TimeLock Vault</h2>
                <p>Securely lock your ETH with time-based smart contracts</p>
                <ul className="features-list">
                  <li>🛡️ Secure time-locked deposits</li>
                  <li>⏰ Flexible unlock durations</li>
                  <li>💎 Multiple concurrent locks</li>
                  <li>📊 Real-time statistics</li>
                </ul>

                <div className="setup-checklist">
                  <h3>📋 Before You Start:</h3>
                  <ol>
                    <li>Start Hardhat node: <code>npx hardhat node</code></li>
                    <li>Deploy contract: <code>npm run deploy</code></li>
                    <li>Update <code>frontend/.env</code> with contract address</li>
                    <li>Connect MetaMask to Hardhat Local (Chain ID: 31337)</li>
                  </ol>
                </div>

                <button className="btn btn-primary btn-lg" onClick={connect}>
                  Get Started
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Statistics Dashboard */}
              <div className="stats-grid">
                <div className="stat-card stat-card-1">
                  <div className="stat-icon">💰</div>
                  <div className="stat-content">
                    <div className="stat-label">Total Locked</div>
                    <div className="stat-value">{stats.totalLocked.toFixed(4)} ETH</div>
                  </div>
                </div>

                <div className="stat-card stat-card-2">
                  <div className="stat-icon">✅</div>
                  <div className="stat-content">
                    <div className="stat-label">Total Withdrawn</div>
                    <div className="stat-value">{stats.totalWithdrawn.toFixed(4)} ETH</div>
                  </div>
                </div>

                <div className="stat-card stat-card-3">
                  <div className="stat-icon">🔒</div>
                  <div className="stat-content">
                    <div className="stat-label">Active Locks</div>
                    <div className="stat-value">{stats.activeLocks}</div>
                  </div>
                </div>

                <div className="stat-card stat-card-4">
                  <div className="stat-icon">📦</div>
                  <div className="stat-content">
                    <div className="stat-label">Completed</div>
                    <div className="stat-value">{stats.completedLocks}</div>
                  </div>
                </div>
              </div>

              {/* Deposit Section */}
              <div className="deposit-section">
                <div className="section-card">
                  <h2 className="section-title">
                    <span className="title-icon">➕</span>
                    Create New Lock
                  </h2>

                  <div className="deposit-form">
                    <div className="form-group">
                      <label>Amount (ETH)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        step="0.01"
                        min="0"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Lock Duration</label>
                        <input
                          type="number"
                          className="form-input"
                          value={unlockDuration}
                          onChange={(e) => setUnlockDuration(e.target.value)}
                          placeholder="Duration"
                          min="1"
                        />
                      </div>

                      <div className="form-group">
                        <label>Unit</label>
                        <select
                          className="form-select"
                          value={durationType}
                          onChange={(e) => setDurationType(e.target.value)}
                        >
                          <option value="seconds">Seconds</option>
                          <option value="minutes">Minutes</option>
                          <option value="hours">Hours</option>
                          <option value="days">Days</option>
                        </select>
                      </div>
                    </div>

                    <button
                      className="btn btn-primary btn-block"
                      onClick={deposit}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner"></span>
                          Processing...
                        </>
                      ) : (
                        <>🔒 Lock ETH</>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Locks Section */}
              <div className="locks-section">
                <div className="section-header">
                  <h2 className="section-title">
                    <span className="title-icon">📋</span>
                    Your Locks
                  </h2>
                  <button
                    className="btn btn-secondary"
                    onClick={loadLocks}
                    disabled={loading}
                  >
                    {loading ? "Refreshing..." : "🔄 Refresh"}
                  </button>
                </div>

                {locks.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h3>No locks yet</h3>
                    <p>Create your first time-locked deposit above</p>
                  </div>
                ) : (
                  <div className="locks-grid">
                    {locks.map((lock, index) => {
                      const isUnlocked = currentTime >= Number(lock.unlockTime);
                      const isWithdrawn = lock.withdrawn;

                      return (
                        <div
                          key={index}
                          className={`lock-card ${isWithdrawn ? 'lock-withdrawn' : isUnlocked ? 'lock-unlocked' : 'lock-active'}`}
                        >
                          <div className="lock-header">
                            <div className="lock-status">
                              {isWithdrawn ? (
                                <span className="status-badge status-withdrawn">✅ Withdrawn</span>
                              ) : isUnlocked ? (
                                <span className="status-badge status-unlocked">🔓 Unlocked</span>
                              ) : (
                                <span className="status-badge status-locked">🔒 Locked</span>
                              )}
                            </div>
                            <div className="lock-index">#{index + 1}</div>
                          </div>

                          <div className="lock-amount">
                            <div className="amount-label">Amount</div>
                            <div className="amount-value">
                              {parseFloat(ethers.formatEther(lock.amount)).toFixed(4)} ETH
                            </div>
                          </div>

                          <div className="lock-details">
                            <div className="detail-row">
                              <span className="detail-label">📤 From</span>
                              <span className="detail-value address-value" title={lock.sender}>
                                {formatAddress(lock.sender)}
                                {lock.sender && lock.sender.toLowerCase() === account.toLowerCase() && (
                                  <span className="badge-you">You</span>
                                )}
                              </span>
                            </div>

                            <div className="detail-row">
                              <span className="detail-label">📥 To</span>
                              <span className="detail-value address-value" title={lock.recipient}>
                                {formatAddress(lock.recipient)}
                                {lock.recipient && lock.recipient.toLowerCase() === account.toLowerCase() && (
                                  <span className="badge-you">You</span>
                                )}
                              </span>
                            </div>

                            <div className="detail-row">
                              <span className="detail-label">Unlock Time</span>
                              <span className="detail-value">
                                {new Date(Number(lock.unlockTime) * 1000).toLocaleString()}
                              </span>
                            </div>

                            {!isWithdrawn && (
                              <div className="detail-row">
                                <span className="detail-label">
                                  {isUnlocked ? "Ready to withdraw" : "Time Remaining"}
                                </span>
                                <span className={`detail-value countdown ${isUnlocked ? 'unlocked' : ''}`}>
                                  {formatCountdown(lock.unlockTime)}
                                </span>
                              </div>
                            )}
                          </div>

                          {!isWithdrawn && isUnlocked && (
                            <button
                              className="btn btn-success btn-block"
                              onClick={() => withdraw(index)}
                              disabled={loading}
                            >
                              {loading ? "Processing..." : "💸 Withdraw"}
                            </button>
                          )}

                          {!isWithdrawn && !isUnlocked && (
                            <div className="lock-progress">
                              <div
                                className="progress-bar"
                                style={{
                                  width: `${Math.min(100, ((currentTime - (Number(lock.unlockTime) - (Number(lock.unlockTime) - currentTime))) / (Number(lock.unlockTime) - (Number(lock.unlockTime) - (Number(lock.unlockTime) - currentTime)))) * 100)}%`
                                }}
                              ></div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>🔒 TimeLock Vault - Secure Time-Based ETH Deposits</p>
          <p className="footer-note">Always verify contract addresses and transactions</p>
        </div>
      </footer>
    </div>
  );
}
