// import { NextResponse } from 'next/server';
// import crypto from 'crypto';

// const API_KEY = process.env.WITHDRAWAL_API_KEY || '';
// const MERCHANT_ID = process.env.WITHDRAWAL_MERCHANT_ID || '';
// const GATEWAY_URL = 'https://inrpay.info/Payment_Dfpay_add.html';

// function generateMd5Sign(params: Record<string, string>): string {
//   const signString = Object.keys(params)
//     .filter(key => params[key])
//     .sort()
//     .map(key => `${key}=${params[key]}`)
//     .join('&') + `&key=${API_KEY}`;
  
//   return crypto.createHash('md5').update(signString).digest('hex').toUpperCase();
// }

// export async function POST(request: Request) {
//   try {
//     const { amount, password, accountName, accountNumber, ifscCode, bankName } = await request.json();
    
//     console.log('Withdrawal request:', { amount, accountName, accountNumber });
    
//     // Validate inputs
//     if (!amount || amount <= 0) {
//       return NextResponse.json({ success: false, message: 'Invalid amount' }, { status: 400 });
//     }
    
//     if (!accountNumber || !ifscCode) {
//       return NextResponse.json({ success: false, message: 'Bank details missing' }, { status: 400 });
//     }
    
//     // Validate IFSC code format
//     if (ifscCode.length !== 11 || ifscCode[4] !== '0') {
//       return NextResponse.json({ 
//         success: false, 
//         message: 'Invalid IFSC code. Must be 11 characters with 5th character as 0' 
//       }, { status: 400 });
//     }

//     // Verify password with your backend
//     const token = request.headers.get('authorization')?.replace('Bearer ', '');
//     const passwordCheck = await fetch('https://ctbackend.crobstacle.com/api/auth/verify-password', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`,
//       },
//       body: JSON.stringify({ password }),
//     });

//     if (!passwordCheck.ok) {
//       return NextResponse.json({ success: false, message: 'Invalid password' }, { status: 401 });
//     }

//     // Generate unique order ID
//     const out_trade_no = `WD${Date.now()}${Math.floor(Math.random() * 1000)}`;
//     const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.cxdventures.com';

//     // Prepare withdrawal parameters
//     const params = {
//       mchid: MERCHANT_ID,
//       out_trade_no,
//       money: Number(amount).toFixed(2),
//       bankname: bankName || 'inrbank',
//       subbranch: `${baseUrl}/api/payment/withdraw-callback`,
//       accountname: accountName,
//       cardnumber: accountNumber,
//       province: ifscCode,
//       city: 'India',
//     };

//     const pay_md5sign = generateMd5Sign(params);

//     const formDataObject = {
//       ...params,
//       pay_md5sign,
//     };

//     console.log('Submitting withdrawal to gateway...');

//     const formData = new URLSearchParams(formDataObject);

//     const response = await fetch(GATEWAY_URL, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//       body: formData.toString(),
//     });

//     const result = await response.json();
//     console.log('Gateway response:', result);

//     if (result.status === 'success') {
//       // Save withdrawal request to database
//       try {
//         await fetch('https://ctbackend.crobstacle.com/api/withdrawals/create', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//             orderId: out_trade_no,
//             transactionId: result.transaction_id,
//             amount: Number(amount),
//             status: 'pending',
//             accountNumber,
//             ifscCode,
//           }),
//         });
//       } catch (error) {
//         console.error('Failed to save withdrawal:', error);
//       }

//       return NextResponse.json({
//         success: true,
//         message: 'Withdrawal request submitted',
//         transactionId: result.transaction_id,
//         orderId: out_trade_no,
//       });
//     } else {
//       return NextResponse.json({
//         success: false,
//         message: result.msg || 'Withdrawal failed',
//       }, { status: 400 });
//     }

//   } catch (error) {
//     console.error('Withdrawal error:', error);
//     return NextResponse.json({
//       success: false,
//       message: 'Server error',
//     }, { status: 500 });
//   }
// }


import { NextResponse } from 'next/server';
import crypto from 'crypto';

const API_KEY = process.env.WITHDRAWAL_API_KEY || '';
const MERCHANT_ID = process.env.WITHDRAWAL_MERCHANT_ID || '';
const GATEWAY_URL = 'https://inrpay.info/Payment_Dfpay_add.html';

function generateMd5Sign(params: Record<string, string>): string {
  const signString = Object.keys(params)
    .filter(key => params[key])
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&') + `&key=${API_KEY}`;
  
  return crypto.createHash('md5').update(signString).digest('hex').toUpperCase();
}

export async function POST(request: Request) {
  try {
    const { amount, accountName, accountNumber, ifscCode, bankName } = await request.json();
    
    console.log('Withdrawal request:', { amount, accountName, accountNumber });
    
    // Validate inputs
    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, message: 'Invalid amount' }, { status: 400 });
    }
    
    if (!accountNumber || !ifscCode) {
      return NextResponse.json({ success: false, message: 'Bank details missing' }, { status: 400 });
    }
    
    // Validate IFSC code format
    if (ifscCode.length !== 11 || ifscCode[4] !== '0') {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid IFSC code. Must be 11 characters with 5th character as 0' 
      }, { status: 400 });
    }

    // Generate unique order ID
    const out_trade_no = `WD${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.cxdventures.com';

    // Prepare withdrawal parameters
    const params = {
      mchid: MERCHANT_ID,
      out_trade_no,
      money: Number(amount).toFixed(2),
      bankname: bankName || 'inrbank',
      subbranch: `${baseUrl}/api/payment/withdraw-callback`,
      accountname: accountName,
      cardnumber: accountNumber,
      province: ifscCode,
      city: 'India',
    };

    const pay_md5sign = generateMd5Sign(params);

    const formDataObject = {
      ...params,
      pay_md5sign,
    };

    console.log('Submitting withdrawal to gateway...');

    const formData = new URLSearchParams(formDataObject);

    const response = await fetch(GATEWAY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const result = await response.json();
    console.log('Gateway response:', result);

    if (result.status === 'success') {
      return NextResponse.json({
        success: true,
        message: 'Withdrawal request submitted',
        transactionId: result.transaction_id,
        orderId: out_trade_no,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.msg || 'Withdrawal failed',
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Withdrawal error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error',
    }, { status: 500 });
  }
}
