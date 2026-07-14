export const PAYMENT_CONFIG = {
  midtrans: {
    serverKey: process.env.MIDTRANS_SERVER_KEY || "",
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "",
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    merchantId: process.env.MIDTRANS_MERCHANT_ID || "",
  },
  enabled: !!process.env.MIDTRANS_SERVER_KEY,
};
