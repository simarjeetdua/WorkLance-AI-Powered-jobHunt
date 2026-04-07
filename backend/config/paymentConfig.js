/**
 * Payment Configuration for WorkLance
 */

const paymentConfig = {
  // ===============================
  // GENERAL SETTINGS
  // ===============================
  currency: "INR",
  platformFeePercent: 10, // platform takes 10% fee

  // ===============================
  // SUPPORTED PAYMENT METHODS
  // ===============================
  methods: ["upi", "card", "netbanking"],

  // ===============================
  // ESCROW SETTINGS
  // ===============================
  escrow: {
    enabled: true,
    autoReleaseDays: 7, // auto release after 7 days (future feature)
  },

  // ===============================
  // PAYMENT LIMITS
  // ===============================
  limits: {
    minAmount: 100,
    maxAmount: 1000000,
  },

  // ===============================
  // PLATFORM FEE CALCULATION
  // ===============================
  calculatePlatformFee: (amount) => {
    return (amount * paymentConfig.platformFeePercent) / 100;
  },

  // ===============================
  // FREELANCER PAYOUT CALCULATION
  // ===============================
  calculateFreelancerPayout: (amount) => {
    const fee = paymentConfig.calculatePlatformFee(amount);
    return amount - fee;
  },

  // ===============================
  // MOCK PAYMENT GATEWAY (FOR NOW)
  // ===============================
  gateway: {
    name: "MockGateway",
    processPayment: async (amount) => {
      return {
        status: "success",
        transactionId: "TXN_" + Date.now(),
        amount,
      };
    },
  },
};

export default paymentConfig;