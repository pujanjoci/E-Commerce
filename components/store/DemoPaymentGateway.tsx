'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  CreditCard,
  QrCode,
  Building,
  Smartphone,
  Calendar,
  Lock,
  ShieldCheck,
  CheckCircle,
  RefreshCw,
  Wallet,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

/* ─── Types and Interfaces ─────────────────────────────────── */
export interface DemoPaymentGatewayProps {
  amount: number;
  onComplete: (transactionId: string) => void;
  onCancel?: () => void;
}

type Step = 'selector' | 'bank-login' | 'otp' | 'success';

interface CountryConfig {
  code: string;
  name: string;
  currency: string;
  symbol: string;
  methods: ('card' | 'upi' | 'wallet' | 'netbanking' | 'paylater' | 'scan')[];
}

/* ─── Country configurations ─────────────────────────────────── */
const COUNTRIES: CountryConfig[] = [
  {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    symbol: '$',
    methods: ['card', 'wallet', 'paylater'],
  },
  {
    code: 'IN',
    name: 'India',
    currency: 'INR',
    symbol: '₹',
    methods: ['card', 'upi', 'netbanking', 'paylater', 'scan'],
  },
  {
    code: 'NP',
    name: 'Nepal',
    currency: 'NPR',
    symbol: 'Rs. ',
    methods: ['card', 'scan', 'wallet', 'netbanking'], // scan is Fonepay, netbanking is connectIPS
  },
  {
    code: 'BR',
    name: 'Brazil',
    currency: 'BRL',
    symbol: 'R$',
    methods: ['card', 'scan', 'wallet'], // scan represents Pix
  },
  {
    code: 'EU',
    name: 'Eurozone',
    currency: 'EUR',
    symbol: '€',
    methods: ['card', 'netbanking', 'wallet'],
  },
];

/* ─── Mock data for different gateways ─────────────────────── */
const WALLETS_BY_COUNTRY: Record<string, { name: string; balance: string }[]> = {
  US: [
    { name: 'PayPal Wallet', balance: '$142.50' },
    { name: 'Venmo Balance', balance: '$320.00' },
  ],
  IN: [
    { name: 'Paytm Wallet', balance: '₹450.00' },
    { name: 'PhonePe Balance', balance: '₹1,200.00' },
  ],
  NP: [
    { name: 'eSewa Wallet', balance: 'Rs. 5,000.00' },
    { name: 'Khalti Wallet', balance: 'Rs. 3,250.00' },
    { name: 'IME Pay', balance: 'Rs. 1,500.00' },
  ],
  BR: [
    { name: 'PicPay', balance: 'R$ 150,00' },
    { name: 'Mercado Pago', balance: 'R$ 800,00' },
  ],
  EU: [
    { name: 'Revolut Pay', balance: '€42.00' },
    { name: 'N26 Space', balance: '€500.00' },
  ],
};

const BANKS_BY_COUNTRY: Record<string, string[]> = {
  IN: ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank'],
  NP: ['Nabil Bank (connectIPS)', 'Global IME Bank (connectIPS)', 'Nepal Investment Mega Bank', 'NIC Asia Bank', 'Prabhu Bank'],
  EU: ['ING Bank (iDEAL)', 'Deutsche Bank (Sofort)', 'BNP Paribas', 'Societe Generale', 'KBC (Bancontact)'],
};

const EMI_PLANS = [
  { months: 3, interest: 0, label: '3 Months (No Cost EMI)' },
  { months: 6, interest: 0.12, label: '6 Months (12% p.a.)' },
  { months: 12, interest: 0.15, label: '12 Months (15% p.a.)' },
];

export default function DemoPaymentGateway({
  amount,
  onComplete,
  onCancel,
}: DemoPaymentGatewayProps) {
  const [country, setCountry] = useState<CountryConfig>(COUNTRIES[0]);
  const [method, setMethod] = useState<'card' | 'upi' | 'wallet' | 'netbanking' | 'paylater' | 'scan'>('card');
  const [step, setStep] = useState<Step>('selector');

  /* -- Screen reader updates -- */
  const [srAnnouncement, setSrAnnouncement] = useState('');

  /* -- Common state -- */
  const [isProcessing, setIsProcessing] = useState(false);
  const [txId, setTxId] = useState('');

  /* -- Card state -- */
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  /* -- UPI state -- */
  const [vpa, setVpa] = useState('');

  /* -- Wallet state -- */
  const [selectedWallet, setSelectedWallet] = useState(0);

  /* -- Netbanking state -- */
  const [selectedBank, setSelectedBank] = useState('');
  const [bankUsername, setBankUsername] = useState('');
  const [bankPassword, setBankPassword] = useState('');

  /* -- EMI state -- */
  const [selectedEmi, setSelectedEmi] = useState(0);

  /* -- Scan state -- */
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'scanned'>('idle');

  /* -- OTP state -- */
  const [otpCode, setOtpCode] = useState('');
  const [otpInputs, setOtpInputs] = useState<string[]>(Array(6).fill(''));
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* -- Initialize unique Tx ID & OTP -- */
  useEffect(() => {
    setTxId(`TXN-${Math.floor(10000000 + Math.random() * 90000000)}`);
  }, [step]);

  const generateOtp = useCallback(() => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpCode(code);
    setOtpInputs(Array(6).fill(''));
    setSrAnnouncement(`New verification code generated and displayed in testing banner: ${code}`);
  }, []);

  // Sync default payment method when country changes
  useEffect(() => {
    if (!country.methods.includes(method)) {
      setMethod(country.methods[0]);
    }
  }, [country, method]);

  /* -- Announce method changes -- */
  const handleMethodChange = (newMethod: typeof method) => {
    setMethod(newMethod);
    setSrAnnouncement(`Payment method changed to ${newMethod}`);
  };

  /* -- Form submissions -- */
  const handlePaymentInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      if (method === 'netbanking') {
        setStep('bank-login');
      } else {
        generateOtp();
        setStep('otp');
      }
    }, 1000);
  };

  const handleBankLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      generateOtp();
      setStep('otp');
    }, 1200);
  };

  const handleSimulateScan = () => {
    setScanStatus('scanning');
    setSrAnnouncement('Scanning simulation started...');
    
    setTimeout(() => {
      setScanStatus('scanned');
      setSrAnnouncement('Scanned successfully. Confirming details on phone...');
      
      setTimeout(() => {
        generateOtp();
        setStep('otp');
        setScanStatus('idle');
      }, 1000);
    }, 800);
  };

  /* -- OTP Input handling -- */
  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const newInputs = [...otpInputs];
    newInputs[index] = digit;
    setOtpInputs(newInputs);

    // Auto-advance focus
    if (digit !== '' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (otpInputs[index] === '' && index > 0) {
        const newInputs = [...otpInputs];
        newInputs[index - 1] = '';
        setOtpInputs(newInputs);
        otpRefs.current[index - 1]?.focus();
      } else {
        const newInputs = [...otpInputs];
        newInputs[index] = '';
        setOtpInputs(newInputs);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleAutofillOtp = () => {
    const digits = otpCode.split('');
    setOtpInputs(digits);
    setSrAnnouncement('Verification code autofilled.');
    otpRefs.current[5]?.focus();
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otpInputs.join('');
    if (entered !== otpCode) {
      alert('Invalid test OTP code entered. Please type or use autofill.');
      return;
    }

    setIsProcessing(true);
    setSrAnnouncement('Verifying transaction...');
    setTimeout(() => {
      setIsProcessing(false);
      setStep('success');
      setSrAnnouncement('Payment completed successfully.');
    }, 1500);
  };

  const handleSuccessClose = () => {
    onComplete(txId);
  };

  /* -- Format helpers -- */
  const formatCardNumber = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 16);
    return clean.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 4);
    return clean.length > 2 ? `${clean.slice(0, 2)}/${clean.slice(2)}` : clean;
  };

  const getEmiMonthlyAmount = (plan: typeof EMI_PLANS[0]) => {
    const principal = amount;
    const interestAmt = principal * plan.interest;
    const totalPayable = principal + interestAmt;
    return (totalPayable / plan.months).toFixed(2);
  };

  const isOtpFilled = otpInputs.every(d => d !== '');

  return (
    <div className="w-full max-w-md mx-auto bg-[var(--ag-surface)] border border-[var(--ag-border)] rounded-2xl overflow-hidden shadow-sm flex flex-col relative text-sm">
      {/* Accessibity Live Announcements */}
      <div className="sr-only" aria-live="polite">
        {srAnnouncement}
      </div>

      {/* ── Selector Step ─────────────────────────── */}
      {step === 'selector' && (
        <div className="p-6 space-y-6">
          {/* Header & Country Select */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--ag-text-primary)]">Select Payment</h2>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[var(--ag-text-muted)]">Region:</span>
              <select
                value={country.code}
                onChange={(e) => {
                  const selected = COUNTRIES.find((c) => c.code === e.target.value);
                  if (selected) setCountry(selected);
                }}
                className="bg-[var(--ag-surface-2)] text-[var(--ag-text-primary)] border border-[var(--ag-border)] text-xs font-semibold px-2 py-1 rounded-md focus:outline-none"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.currency})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid method icons */}
          <div className="grid grid-cols-3 gap-2">
            {country.methods.includes('card') && (
              <button
                type="button"
                onClick={() => handleMethodChange('card')}
                className={`py-3 px-1 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                  method === 'card'
                    ? 'border-[var(--ag-accent)] bg-[var(--ag-accent-muted)] text-[var(--ag-accent-hover)]'
                    : 'border-[var(--ag-border)] bg-[var(--ag-surface)] text-[var(--ag-text-secondary)] hover:border-[var(--ag-border-strong)]'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Card
              </button>
            )}

            {country.methods.includes('upi') && (
              <button
                type="button"
                onClick={() => handleMethodChange('upi')}
                className={`py-3 px-1 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                  method === 'upi'
                    ? 'border-[var(--ag-accent)] bg-[var(--ag-accent-muted)] text-[var(--ag-accent-hover)]'
                    : 'border-[var(--ag-border)] bg-[var(--ag-surface)] text-[var(--ag-text-secondary)] hover:border-[var(--ag-border-strong)]'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                UPI
              </button>
            )}

            {country.methods.includes('wallet') && (
              <button
                type="button"
                onClick={() => handleMethodChange('wallet')}
                className={`py-3 px-1 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                  method === 'wallet'
                    ? 'border-[var(--ag-accent)] bg-[var(--ag-accent-muted)] text-[var(--ag-accent-hover)]'
                    : 'border-[var(--ag-border)] bg-[var(--ag-surface)] text-[var(--ag-text-secondary)] hover:border-[var(--ag-border-strong)]'
                }`}
              >
                <Wallet className="w-4 h-4" />
                Wallets
              </button>
            )}

            {country.methods.includes('netbanking') && (
              <button
                type="button"
                onClick={() => handleMethodChange('netbanking')}
                className={`py-3 px-1 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                  method === 'netbanking'
                    ? 'border-[var(--ag-accent)] bg-[var(--ag-accent-muted)] text-[var(--ag-accent-hover)]'
                    : 'border-[var(--ag-border)] bg-[var(--ag-surface)] text-[var(--ag-text-secondary)] hover:border-[var(--ag-border-strong)]'
                }`}
              >
                <Building className="w-4 h-4" />
                Netbanking
              </button>
            )}

            {country.methods.includes('paylater') && (
              <button
                type="button"
                onClick={() => handleMethodChange('paylater')}
                className={`py-3 px-1 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                  method === 'paylater'
                    ? 'border-[var(--ag-accent)] bg-[var(--ag-accent-muted)] text-[var(--ag-accent-hover)]'
                    : 'border-[var(--ag-border)] bg-[var(--ag-surface)] text-[var(--ag-text-secondary)] hover:border-[var(--ag-border-strong)]'
                }`}
              >
                <Calendar className="w-4 h-4" />
                EMI / Later
              </button>
            )}

            {country.methods.includes('scan') && (
              <button
                type="button"
                onClick={() => handleMethodChange('scan')}
                className={`py-3 px-1 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                  method === 'scan'
                    ? 'border-[var(--ag-accent)] bg-[var(--ag-accent-muted)] text-[var(--ag-accent-hover)]'
                    : 'border-[var(--ag-border)] bg-[var(--ag-surface)] text-[var(--ag-text-secondary)] hover:border-[var(--ag-border-strong)]'
                }`}
              >
                <QrCode className="w-4 h-4" />
                {country.code === 'BR' ? 'Pix QR' : country.code === 'NP' ? 'Fonepay' : 'Scan & Pay'}
              </button>
            )}
          </div>

          {/* Form details based on chosen method */}
          <form onSubmit={handlePaymentInitiate} className="space-y-4">
            {/* 1. CARD FORM */}
            {method === 'card' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--ag-text-secondary)] mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full h-10 px-3 bg-[var(--ag-surface)] border border-[var(--ag-border)] rounded-lg text-sm text-[var(--ag-text-primary)] placeholder-[var(--ag-text-muted)] focus:outline-none focus:border-[var(--ag-accent)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--ag-text-secondary)] mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    className="w-full h-10 px-3 bg-[var(--ag-surface)] border border-[var(--ag-border)] rounded-lg text-sm text-[var(--ag-text-primary)] placeholder-[var(--ag-text-muted)] focus:outline-none focus:border-[var(--ag-accent)]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--ag-text-secondary)] mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      className="w-full h-10 px-3 bg-[var(--ag-surface)] border border-[var(--ag-border)] rounded-lg text-sm text-[var(--ag-text-primary)] placeholder-[var(--ag-text-muted)] focus:outline-none focus:border-[var(--ag-accent)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--ag-text-secondary)] mb-1">
                      CVC / CVV
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="000"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      className="w-full h-10 px-3 bg-[var(--ag-surface)] border border-[var(--ag-border)] rounded-lg text-sm text-[var(--ag-text-primary)] placeholder-[var(--ag-text-muted)] focus:outline-none focus:border-[var(--ag-accent)]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. UPI FORM */}
            {method === 'upi' && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-[var(--ag-text-secondary)]">
                  Enter UPI VPA ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="name@bank"
                  value={vpa}
                  onChange={(e) => setVpa(e.target.value)}
                  className="w-full h-10 px-3 bg-[var(--ag-surface)] border border-[var(--ag-border)] rounded-lg text-sm text-[var(--ag-text-primary)] placeholder-[var(--ag-text-muted)] focus:outline-none focus:border-[var(--ag-accent)]"
                />
                <p className="text-[11px] text-[var(--ag-text-muted)]">
                  A payment authorization request will be sent to this handle in your UPI app.
                </p>
              </div>
            )}

            {/* 3. WALLETS FORM */}
            {method === 'wallet' && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-[var(--ag-text-secondary)] mb-1">
                  Select Wallet Provider
                </label>
                <div className="space-y-2">
                  {(WALLETS_BY_COUNTRY[country.code] || []).map((w, idx) => (
                    <label
                      key={w.name}
                      className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-colors ${
                        selectedWallet === idx
                          ? 'border-[var(--ag-accent)] bg-[var(--ag-accent-muted)]/20'
                          : 'border-[var(--ag-border)] hover:border-[var(--ag-border-strong)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="wallet-select"
                          checked={selectedWallet === idx}
                          onChange={() => setSelectedWallet(idx)}
                          className="text-[var(--ag-accent)] focus:ring-[var(--ag-accent)]"
                        />
                        <span className="font-semibold text-[var(--ag-text-primary)]">{w.name}</span>
                      </div>
                      <span className="font-mono text-xs text-[var(--ag-text-secondary)]">
                        Balance: {w.balance}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 4. NETBANKING FORM */}
            {method === 'netbanking' && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-[var(--ag-text-secondary)] mb-1">
                  Choose Bank
                </label>
                <select
                  required
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full h-10 px-3 bg-[var(--ag-surface)] border border-[var(--ag-border)] rounded-lg text-sm text-[var(--ag-text-primary)] focus:outline-none focus:border-[var(--ag-accent)]"
                >
                  <option value="">-- Select Bank --</option>
                  {(BANKS_BY_COUNTRY[country.code] || []).map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[var(--ag-text-muted)]">
                  You will be securely redirected to the simulated login portal for this bank.
                </p>
              </div>
            )}

            {/* 5. EMI FORM */}
            {method === 'paylater' && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-[var(--ag-text-secondary)] mb-2">
                  Installment / Later Plans
                </label>
                <div className="space-y-2">
                  {EMI_PLANS.map((plan, idx) => (
                    <label
                      key={plan.label}
                      className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-colors ${
                        selectedEmi === idx
                          ? 'border-[var(--ag-accent)] bg-[var(--ag-accent-muted)]/20'
                          : 'border-[var(--ag-border)] hover:border-[var(--ag-border-strong)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="emi-select"
                          checked={selectedEmi === idx}
                          onChange={() => setSelectedEmi(idx)}
                          className="text-[var(--ag-accent)] focus:ring-[var(--ag-accent)]"
                        />
                        <div>
                          <span className="block font-semibold text-[var(--ag-text-primary)]">
                            {plan.label}
                          </span>
                          <span className="text-xs text-[var(--ag-text-muted)]">
                            Monthly payments
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-[var(--ag-text-primary)]">
                        {country.symbol}
                        {getEmiMonthlyAmount(plan)}/mo
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 6. SCAN FORM */}
            {method === 'scan' && (
              <div className="flex flex-col items-center justify-center py-2 space-y-4">
                <div className="p-3 bg-white border border-[var(--ag-border)] rounded-xl shadow-inner">
                  <QRCodeSVG
                    value={`sandbox-pay://txn/${txId}?amount=${amount}`}
                    size={160}
                    level="H"
                  />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-semibold text-xs text-[var(--ag-text-primary)]">
                    {country.code === 'NP' ? 'Scan Fonepay Merchant QR' : country.code === 'BR' ? 'Scan Pix QR to pay' : 'Scan with your Mobile Banking App'}
                  </p>
                  <p className="text-[10px] text-[var(--ag-text-muted)] font-mono max-w-[240px] truncate">
                    Ref: {txId}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSimulateScan}
                  disabled={scanStatus !== 'idle'}
                  className="w-full max-w-[200px] h-9 rounded-lg border border-[var(--ag-border)] hover:bg-[var(--ag-surface-2)] text-xs font-semibold text-[var(--ag-text-primary)] flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {scanStatus === 'scanning' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Scanning...
                    </>
                  ) : scanStatus === 'scanned' ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-[var(--ag-success)]" />
                      Confirming on phone...
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-3.5 h-3.5" />
                      Simulate Scan (Desktop)
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Footer Summary & Pay CTA */}
            {method !== 'scan' && (
              <div className="pt-2 border-t border-[var(--ag-border)] space-y-4">
                <div className="flex items-center justify-between text-xs text-[var(--ag-text-secondary)]">
                  <span>Payable Amount:</span>
                  <span className="font-mono font-bold text-[var(--ag-text-primary)] text-sm">
                    {country.symbol}
                    {amount.toFixed(2)}
                  </span>
                </div>

                <div className="flex gap-2">
                  {onCancel && (
                    <button
                      type="button"
                      onClick={onCancel}
                      className="flex-1 h-11 border border-[var(--ag-border)] hover:bg-[var(--ag-surface-2)] rounded-xl font-semibold text-xs text-[var(--ag-text-secondary)] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-[2] h-11 bg-[var(--ag-text-primary)] text-[var(--ag-base)] hover:opacity-90 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Redirecting...
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        Pay {country.symbol}
                        {amount.toFixed(2)}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ── Netbanking Bank Login Step ───────────── */}
      {step === 'bank-login' && (
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--ag-text-muted)] border-b border-[var(--ag-border)] pb-3">
            <Building className="w-4 h-4 text-[var(--ag-accent)]" />
            <span>Simulated Bank Portal — {selectedBank}</span>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 p-3 rounded-lg flex gap-2 text-xs text-blue-800 dark:text-blue-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>
              For verification, you can enter any username and password to log in and authorize this payment.
            </p>
          </div>

          <form onSubmit={handleBankLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--ag-text-secondary)] mb-1">
                Customer ID / Username
              </label>
              <input
                type="text"
                required
                placeholder="sandbox_user"
                value={bankUsername}
                onChange={(e) => setBankUsername(e.target.value)}
                className="w-full h-10 px-3 bg-[var(--ag-surface)] border border-[var(--ag-border)] rounded-lg text-sm text-[var(--ag-text-primary)] focus:outline-none focus:border-[var(--ag-accent)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--ag-text-secondary)] mb-1">
                Password / Secure PIN
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={bankPassword}
                onChange={(e) => setBankPassword(e.target.value)}
                className="w-full h-10 px-3 bg-[var(--ag-surface)] border border-[var(--ag-border)] rounded-lg text-sm text-[var(--ag-text-primary)] focus:outline-none focus:border-[var(--ag-accent)]"
              />
            </div>

            <div className="pt-2 border-t border-[var(--ag-border)] flex gap-2">
              <button
                type="button"
                onClick={() => setStep('selector')}
                className="flex-1 h-10 border border-[var(--ag-border)] hover:bg-[var(--ag-surface-2)] rounded-lg text-xs font-semibold text-[var(--ag-text-secondary)] transition-colors cursor-pointer"
              >
                Go Back
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-[2] h-10 bg-[var(--ag-text-primary)] text-[var(--ag-base)] hover:opacity-90 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Authorizing...
                  </>
                ) : (
                  'Login & Authorize'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── OTP Verification Step ─────────────────── */}
      {step === 'otp' && (
        <div className="p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[var(--ag-text-primary)] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[var(--ag-accent)]" />
              Two-Factor Authentication
            </h2>
            <p className="text-xs text-[var(--ag-text-muted)]">
              Simulating standard bank/gateway verification check.
            </p>
          </div>

          {/* OTP code announcement banner */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl text-center space-y-1">
            <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              Verification Code (Sent to registered device)
            </span>
            <span className="block text-2xl font-mono font-bold tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
              {otpCode}
            </span>
          </div>

          <form onSubmit={handleOtpVerify} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[var(--ag-text-secondary)] text-center">
                Enter 6-digit Verification Code
              </label>

              {/* Grid 6 inputs */}
              <div className="flex justify-between gap-1.5 max-w-[280px] mx-auto">
                {otpInputs.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    pattern="[0-9]*"
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-10 h-11 border border-[var(--ag-border)] bg-[var(--ag-surface-2)] text-[var(--ag-text-primary)] rounded-lg text-center font-mono font-bold text-lg focus:outline-none focus:border-[var(--ag-accent)] focus:ring-1 focus:ring-[var(--ag-accent)]"
                  />
                ))}
              </div>
            </div>

            {/* Test Autofill Button */}
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={handleAutofillOtp}
                className="text-xs font-semibold text-[var(--ag-accent)] hover:text-[var(--ag-accent-hover)] hover:underline border border-[var(--ag-accent)]/20 px-3 py-1.5 rounded-lg bg-[var(--ag-accent-muted)]/10 cursor-pointer"
              >
                Autofill for testing
              </button>

              <div className="flex items-center gap-1.5 text-xs text-[var(--ag-text-secondary)]">
                <span>Didn't get code?</span>
                <button
                  type="button"
                  onClick={generateOtp}
                  className="font-bold text-[var(--ag-text-primary)] hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  Resend code
                </button>
              </div>
            </div>

            {/* Cta Row */}
            <div className="pt-2 border-t border-[var(--ag-border)] flex gap-2">
              <button
                type="button"
                onClick={() => setStep('selector')}
                className="flex-1 h-11 border border-[var(--ag-border)] hover:bg-[var(--ag-surface-2)] rounded-xl text-xs font-semibold text-[var(--ag-text-secondary)] transition-colors cursor-pointer"
              >
                Go Back
              </button>
              <button
                type="submit"
                disabled={!isOtpFilled || isProcessing}
                className="flex-[2] h-11 bg-[var(--ag-text-primary)] text-[var(--ag-base)] hover:opacity-90 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Verify & Pay
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Success Step ──────────────────────────── */}
      {step === 'success' && (
        <div className="p-6 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[var(--ag-success)]/10 border border-[var(--ag-success)]/30 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-[var(--ag-success)]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-[var(--ag-text-primary)]">
              Payment Successful
            </h2>
            <p className="text-xs text-[var(--ag-text-muted)] max-w-[260px] mx-auto">
              Your transaction has been processed successfully. Thank you for your order!
            </p>
          </div>

          {/* Details ticket */}
          <div className="p-4 bg-[var(--ag-surface-2)] border border-[var(--ag-border)] rounded-xl text-left space-y-2.5 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--ag-text-muted)]">REF NO:</span>
              <span className="text-[var(--ag-text-primary)] font-bold">{txId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--ag-text-muted)]">STATUS:</span>
              <span className="text-[var(--ag-success)] font-bold">COMPLETED</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--ag-text-muted)]">METHOD:</span>
              <span className="text-[var(--ag-text-primary)] font-bold uppercase">
                {method} ({country.code})
              </span>
            </div>
            <div className="flex justify-between border-t border-[var(--ag-border)] pt-2 font-sans font-bold">
              <span className="text-[var(--ag-text-primary)]">PAID AMOUNT</span>
              <span className="text-[var(--ag-text-primary)]">
                {country.symbol}
                {amount.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSuccessClose}
            className="w-full h-11 bg-[var(--ag-text-primary)] text-[var(--ag-base)] hover:opacity-90 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-opacity cursor-pointer"
          >
            Finish Checkout
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Security Footer */}
      <div className="bg-[var(--ag-base)] border-t border-[var(--ag-border)]/50 px-6 py-3 flex items-center justify-between text-[11px] text-[var(--ag-text-muted)]">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--ag-success)]" />
          <span>SSL 256-bit encrypted</span>
        </div>
        <span>Gateway Service API v3.1</span>
      </div>
    </div>
  );
}
