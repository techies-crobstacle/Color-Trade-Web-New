// import { NextResponse } from 'next/server';
// import crypto from 'crypto';

// const API_KEY = process.env.PAYMENT_API_KEY || '';
// const PAYMENT_GATEWAY_URL = 'https://inrpay.info/Pay_Index.html';
// const MERCHANT_ID = process.env.PAYMENT_MERCHANT_ID || '';

// interface PaymentData {
//   pay_memberid: string;
//   pay_orderid: string;
//   pay_applydate: string;
//   pay_bankcode: string;
//   pay_notifyurl: string;
//   pay_callbackurl: string;
//   pay_amount: string;
// }

// // Generate MD5 signature (without pay_productname)
// function generateMd5Sign(params: PaymentData): string {
//   // Sort keys in ASCII order
//   const sortedKeys = Object.keys(params).sort();
  
//   console.log('\n=== MD5 Signature Generation Debug ===');
//   console.log('Parameters for signature:', params);
//   console.log('Sorted Keys:', sortedKeys);
  
//   // Build the string for signing (without URL encoding first, then encode)
//   const paramsArray = sortedKeys.map(key => {
//     const value = params[key as keyof PaymentData];
//     console.log(`  ${key} = ${value}`);
//     return `${key}=${value}`;
//   });
  
//   const signString = paramsArray.join('&');
//   console.log('\nString before adding key (NOT URL encoded):', signString);
  
//   const finalString = `${signString}&key=${API_KEY}`;
//   console.log('Final string with key:', finalString);
  
//   const md5Hash = crypto.createHash('md5').update(finalString).digest('hex').toUpperCase();
//   console.log('Generated MD5 signature:', md5Hash);
//   console.log('=== End Debug ===\n');
  
//   return md5Hash;
// }

// export async function POST(request: Request) {
//   try {
//     const { amount, userId } = await request.json();
    
//     console.log('Payment request received:', { amount, userId });
    
//     if (!amount || amount <= 0) {
//       return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
//     }

//     if (!API_KEY || !MERCHANT_ID) {
//       console.error('Missing environment variables');
//       return NextResponse.json({ 
//         success: false, 
//         message: 'Server configuration error' 
//       }, { status: 500 });
//     }

//     const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
//     const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
//     const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

//     // Parameters for MD5 signature (without pay_productname)
//     const paramsForSignature: PaymentData = {
//       pay_memberid: MERCHANT_ID,
//       pay_orderid: orderId,
//       pay_applydate: currentDate,
//       pay_bankcode: '2',
//       pay_notifyurl: `${baseUrl}/api/payment/callback`,
//       pay_callbackurl: `${baseUrl}/wallet/deposit-success`,
//       pay_amount: Number(amount).toFixed(2),
//     };

//     // Generate MD5 signature
//     const md5Sign = generateMd5Sign(paramsForSignature);

//     // Prepare form data (now including pay_productname)
//     const formDataObject: Record<string, string> = {
//       pay_memberid: paramsForSignature.pay_memberid,
//       pay_orderid: paramsForSignature.pay_orderid,
//       pay_applydate: paramsForSignature.pay_applydate,
//       pay_bankcode: paramsForSignature.pay_bankcode,
//       pay_notifyurl: paramsForSignature.pay_notifyurl,
//       pay_callbackurl: paramsForSignature.pay_callbackurl,
//       pay_amount: paramsForSignature.pay_amount,
//       pay_productname: 'deposit', // Added but not in signature
//       pay_md5sign: md5Sign,
//     };

//     console.log('\nForm Data being sent (with pay_productname):', formDataObject);

//     const formData = new URLSearchParams(formDataObject);

//     console.log('\nCalling payment gateway...');
//     console.log('URL:', PAYMENT_GATEWAY_URL);
//     console.log('Body:', formData.toString());

//     const response = await fetch(PAYMENT_GATEWAY_URL, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//       body: formData.toString(),
//     });

//     const result = await response.json();
//     console.log('\nPayment Gateway Response:', result);

//     if (result.status === 'success') {
//       return NextResponse.json({
//         success: true,
//         paymentUrl: result.pay_url,
//         orderId: orderId,
//       });
//     } else {
//       return NextResponse.json({
//         success: false,
//         message: result.msg || 'Payment initiation failed',
//       }, { status: 400 });
//     }

//   } catch (error) {
//     console.error('Payment initiation error:', error);
//     return NextResponse.json({
//       success: false,
//       message: 'Server error occurred',
//     }, { status: 500 });
//   }
// }


import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { saveOrder } from '@/lib/orderStore';

const API_KEY = process.env.PAYMENT_API_KEY || '';
const PAYMENT_GATEWAY_URL = 'https://inrpay.info/Pay_Index.html';
const MERCHANT_ID = process.env.PAYMENT_MERCHANT_ID || '';

interface PaymentData {
  pay_memberid: string;
  pay_orderid: string;
  pay_applydate: string;
  pay_bankcode: string;
  pay_notifyurl: string;
  pay_callbackurl: string;
  pay_amount: string;
}

function generateMd5Sign(params: PaymentData): string {
  const sortedKeys = Object.keys(params).sort();
  
  console.log('\n=== MD5 Signature Generation ===');
  console.log('Parameters for signature:', params);
  
  const paramsArray = sortedKeys.map(key => {
    const value = params[key as keyof PaymentData];
    console.log(`  ${key} = ${value}`);
    return `${key}=${value}`;
  });
  
  const signString = paramsArray.join('&');
  console.log('\nString before adding key:', signString);
  
  const finalString = `${signString}&key=${API_KEY}`;
  console.log('Final string with key:', finalString);
  
  const md5Hash = crypto.createHash('md5').update(finalString).digest('hex').toUpperCase();
  console.log('Generated MD5 signature:', md5Hash);
  console.log('=== End Debug ===\n');
  
  return md5Hash;
}

export async function POST(request: Request) {
  try {
    const { amount, userId } = await request.json();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    console.log('\n========================================');
    console.log('💳 PAYMENT INITIATION REQUEST');
    console.log('========================================');
    console.log('Amount:', amount);
    console.log('User ID:', userId || 'Not provided');
    console.log('Has Token:', !!token);
    
    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid amount' 
      }, { status: 400 });
    }

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized - No token provided' 
      }, { status: 401 });
    }

    if (!API_KEY || !MERCHANT_ID) {
      console.error('❌ Missing environment variables');
      return NextResponse.json({ 
        success: false, 
        message: 'Server configuration error' 
      }, { status: 500 });
    }

    // Generate order ID
    const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    console.log('\nGenerated Order ID:', orderId);

    // ============================================
    // STEP 1: Save order-user mapping locally
    // ============================================
    console.log('\n--- Saving Order to Local Store ---');
    saveOrder(orderId, {
      userId,
      token,
      amount: Number(amount),
    });

    // ============================================
    // STEP 2: Prepare payment gateway request
    // ============================================
    console.log('\n--- Preparing Payment Gateway Request ---');
    
    const paramsForSignature: PaymentData = {
      pay_memberid: MERCHANT_ID,
      pay_orderid: orderId,
      pay_applydate: currentDate,
      pay_bankcode: '2',
      pay_notifyurl: `${baseUrl}/api/payment/callback`,
      pay_callbackurl: `${baseUrl}/wallet/deposit-success`,
      pay_amount: Number(amount).toFixed(2),
    };

    const md5Sign = generateMd5Sign(paramsForSignature);

    const formDataObject: Record<string, string> = {
      pay_memberid: paramsForSignature.pay_memberid,
      pay_orderid: paramsForSignature.pay_orderid,
      pay_applydate: paramsForSignature.pay_applydate,
      pay_bankcode: paramsForSignature.pay_bankcode,
      pay_notifyurl: paramsForSignature.pay_notifyurl,
      pay_callbackurl: paramsForSignature.pay_callbackurl,
      pay_amount: paramsForSignature.pay_amount,
      pay_productname: 'deposit',
      pay_md5sign: md5Sign,
    };

    console.log('\nForm Data (with pay_productname):', formDataObject);

    const formData = new URLSearchParams(formDataObject);

    // ============================================
    // STEP 3: Call Payment Gateway
    // ============================================
    console.log('\n--- Calling Payment Gateway ---');
    console.log('URL:', PAYMENT_GATEWAY_URL);

    const response = await fetch(PAYMENT_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const result = await response.json();
    console.log('\n--- Payment Gateway Response ---');
    console.log('Status:', result.status);
    console.log('Response:', result);

    if (result.status === 'success') {
      console.log('✅ Payment initiated successfully');
      console.log('Payment URL:', result.pay_url);
      console.log('========================================\n');
      
      return NextResponse.json({
        success: true,
        paymentUrl: result.pay_url,
        orderId: orderId,
        message: 'Payment initiated successfully',
      });
    } else {
      console.error('❌ Payment initiation failed');
      console.error('Message:', result.msg);
      console.log('========================================\n');
      
      return NextResponse.json({
        success: false,
        message: result.msg || 'Payment initiation failed',
      }, { status: 400 });
    }

  } catch (error) {
    console.error('\n❌ Payment initiation error:', error);
    console.log('========================================\n');
    
    return NextResponse.json({
      success: false,
      message: 'Server error occurred',
    }, { status: 500 });
  }
}
