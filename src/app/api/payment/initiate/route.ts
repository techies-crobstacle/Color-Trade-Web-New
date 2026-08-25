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

// Proxy payment initiation to backend so gateway keys remain server-side
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = request.headers.get('authorization') || '';

    if (!body.amount || body.amount <= 0) {
      return NextResponse.json({ success: false, message: 'Invalid amount' }, { status: 400 });
    }

    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://ctbackend.realdaddygame.com'}/api/wallet/deposit/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(body)
    });

    const result = await backendRes.json();
    return NextResponse.json(result, { status: backendRes.status });
  } catch (err) {
    console.error('Payment initiation proxy error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
