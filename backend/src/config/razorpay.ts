import Razorpay from 'razorpay';
import { config } from './index';

let razorpayInstance: any = null;

export const getRazorpayInstance = (): any => {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
  }
  return razorpayInstance;
};
