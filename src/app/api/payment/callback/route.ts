// import crypto from 'crypto';
// import { NextRequest } from 'next/server';

// const API_KEY = process.env.PAYMENT_API_KEY || '';
// // const ALLOWED_IP = '141.193.153.162';

// export async function POST(req: NextRequest) {
//   const startTime = Date.now();
  
//   console.log('\n========================================');
//   console.log('🔔 PAYMENT CALLBACK RECEIVED');
//   console.log('========================================');
//   console.log(`Timestamp: ${new Date().toISOString()}`);
  
//   try {
//     // IP Verification
//     const forwardedFor = req.headers.get('x-forwarded-for');
//     const realIp = req.headers.get('x-real-ip');
//     const cfConnectingIp = req.headers.get('cf-connecting-ip');
//     const clientIp = cfConnectingIp || forwardedFor?.split(',')[0] || realIp || 'unknown';
    
//     console.log(`Client IP: ${clientIp}`);
    
//     // Temporarily disable IP check for testing
//     // if (clientIp !== ALLOWED_IP) {
//     //   console.error(`❌ IP VERIFICATION FAILED: ${clientIp}`);
//     //   return new Response('UNAUTHORIZED', { 
//     //     status: 403,
//     //     headers: { 'Content-Type': 'text/plain' }
//     //   });
//     // }
    
//     // Parse form data
//     const formData = await req.formData();
    
//     const params = {
//       memberid: formData.get('memberid') as string,
//       orderid: formData.get('orderid') as string,
//       transaction_id: formData.get('transaction_id') as string,
//       amount: formData.get('amount') as string,
//       datetime: formData.get('datetime') as string,
//       returncode: formData.get('returncode') as string,
//       sign: formData.get('sign') as string,
//       attach: formData.get('attach') as string || '',
//     };

//     console.log('Callback data:', JSON.stringify(params, null, 2));
    
//     // Verify signature
//     const signString = Object.keys(params)
//       .filter(key => key !== 'sign' && key !== 'attach')
//       .sort()
//       .map(key => `${key}=${params[key as keyof typeof params]}`)
//       .join('&') + `&key=${API_KEY}`;
    
//     console.log('Sign string:', signString);
    
//     const calculatedSign = crypto.createHash('md5').update(signString).digest('hex').toUpperCase();
    
//     console.log(`Calculated: ${calculatedSign}`);
//     console.log(`Received: ${params.sign}`);
//     console.log(`Match: ${calculatedSign === params.sign}`);

//     if (calculatedSign !== params.sign) {
//       console.error('❌ SIGNATURE FAILED');
//       return new Response('FAIL', { 
//         status: 400,
//         headers: { 'Content-Type': 'text/plain' }
//       });
//     }

//     console.log('✅ Signature verified');

//     // Check return code
//     if (params.returncode !== '00') {
//       console.log(`❌ Return code not 00: ${params.returncode}`);
//       return new Response('OK', { 
//         status: 200,
//         headers: { 'Content-Type': 'text/plain' }
//       });
//     }

//     console.log('✅ Payment successful!');
//     console.log(`Order: ${params.orderid}, Amount: ₹${params.amount}`);

//     // Credit wallet
//     try {
//       const token = process.env.BACKEND_API_TOKEN;
      
//       if (token) {
//         const walletResponse = await fetch('https://ctbackend.crobstacle.com/api/wallet/credit', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//             orderId: params.orderid,
//             transactionId: params.transaction_id,
//             amount: parseFloat(params.amount),
//             datetime: params.datetime,
//           }),
//         });

//         if (walletResponse.ok) {
//           console.log('💰 Wallet credited successfully');
//         } else {
//           console.error(`⚠️ Wallet credit failed: ${walletResponse.status}`);
//         }
//       }
//     } catch (error) {
//       console.error('⚠️ Backend error:', error);
//     }

//     const processingTime = Date.now() - startTime;
//     console.log(`✅ Responding OK (${processingTime}ms)`);
//     console.log('========================================\n');
    
//     // CRITICAL: Return plain text OK
//     return new Response('OK', { 
//       status: 200,
//       headers: { 
//         'Content-Type': 'text/plain',
//         'Cache-Control': 'no-store',
//       }
//     });

//   } catch (error) {
//     console.error('❌ ERROR:', error);
    
//     // Still return OK to acknowledge receipt
//     return new Response('OK', { 
//       status: 200,
//       headers: { 
//         'Content-Type': 'text/plain',
//         'Cache-Control': 'no-store',
//       }
//     });
//   }
// }

// export async function GET() {
//   return new Response(JSON.stringify({
//     status: 'active',
//     endpoint: '/api/payment/callback',
//     method: 'POST',
//     timestamp: new Date().toISOString(),
//   }, null, 2), {
//     status: 200,
//     headers: { 'Content-Type': 'application/json' },
//   });
// }



import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { getOrder, deleteOrder } from '@/lib/orderStore';

const API_KEY = process.env.PAYMENT_API_KEY || '';
const ALLOWED_IP = '141.193.153.162';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  console.log('\n========================================');
  console.log('🔔 PAYMENT CALLBACK RECEIVED');
  console.log('========================================');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  try {
    // ============================================
    // SECURITY CHECK 1: Verify IP Address
    // ============================================
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfConnectingIp = req.headers.get('cf-connecting-ip');
    const clientIp = cfConnectingIp || forwardedFor?.split(',')[0] || realIp || 'unknown';
    
    console.log('\n--- IP VERIFICATION ---');
    console.log(`Client IP: ${clientIp}`);
    console.log(`Expected IP: ${ALLOWED_IP}`);
    console.log(`Headers: x-forwarded-for=${forwardedFor}, x-real-ip=${realIp}, cf-connecting-ip=${cfConnectingIp}`);
    
    if (clientIp !== ALLOWED_IP) {
      console.error(`❌ IP VERIFICATION FAILED`);
      console.error(`Received from: ${clientIp}, Expected: ${ALLOWED_IP}`);
      console.log('========================================\n');
      return new Response('UNAUTHORIZED', { 
        status: 403,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    console.log('✅ IP verified successfully');
    
    // ============================================
    // Parse Callback Data
    // ============================================
    console.log('\n--- PARSING CALLBACK DATA ---');
    const formData = await req.formData();
    
    const params = {
      memberid: formData.get('memberid') as string,
      orderid: formData.get('orderid') as string,
      transaction_id: formData.get('transaction_id') as string,
      amount: formData.get('amount') as string,
      datetime: formData.get('datetime') as string,
      returncode: formData.get('returncode') as string,
      sign: formData.get('sign') as string,
      attach: formData.get('attach') as string || '',
    };

    console.log('Received Parameters:');
    console.log(JSON.stringify(params, null, 2));
    
    // ============================================
    // SECURITY CHECK 2: Verify MD5 Signature
    // ============================================
    console.log('\n--- MD5 SIGNATURE VERIFICATION ---');
    
    const signString = Object.keys(params)
      .filter(key => key !== 'sign' && key !== 'attach')
      .sort()
      .map(key => `${key}=${params[key as keyof typeof params]}`)
      .join('&') + `&key=${API_KEY}`;
    
    console.log('String for signature:');
    console.log(signString);
    
    const calculatedSign = crypto.createHash('md5').update(signString).digest('hex').toUpperCase();
    
    console.log(`Calculated Sign: ${calculatedSign}`);
    console.log(`Received Sign:   ${params.sign}`);
    console.log(`Match: ${calculatedSign === params.sign}`);

    if (calculatedSign !== params.sign) {
      console.error('❌ SIGNATURE VERIFICATION FAILED');
      console.error('Signature mismatch detected');
      console.log('========================================\n');
      return new Response('FAIL', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    console.log('✅ Signature verified successfully');

    // ============================================
    // SECURITY CHECK 3: Verify Return Code
    // ============================================
    console.log('\n--- RETURN CODE VERIFICATION ---');
    console.log(`Return Code: ${params.returncode}`);
    console.log(`Expected: 00 (success)`);
    console.log(`Match: ${params.returncode === '00'}`);
    
    if (params.returncode !== '00') {
      console.log(`❌ Payment not successful - Return code: ${params.returncode}`);
      console.log('Status: Payment failed or pending');
      console.log('Skipping wallet credit');
      console.log('========================================\n');
      return new Response('OK', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    console.log('✅ Return code verified (payment successful)');

    // ============================================
    // ALL CHECKS PASSED
    // ============================================
    console.log('\n========================================');
    console.log('✅ ALL SECURITY CHECKS PASSED');
    console.log('========================================');
    console.log('Payment Details:');
    console.log(`  Merchant ID: ${params.memberid}`);
    console.log(`  Order ID: ${params.orderid}`);
    console.log(`  Transaction ID: ${params.transaction_id}`);
    console.log(`  Amount: ₹${params.amount}`);
    console.log(`  DateTime: ${params.datetime}`);
    console.log('---');

    // ============================================
    // STEP 1: Get Stored Order Data
    // ============================================
    console.log('\n--- RETRIEVING ORDER FROM STORE ---');
    const orderData = getOrder(params.orderid);

    if (!orderData) {
      console.error('❌ Order not found in local store!');
      console.error('Possible reasons:');
      console.error('  - Order expired (>24 hours old)');
      console.error('  - Server was restarted');
      console.error('  - Order was never created');
      console.log('========================================\n');
      return new Response('OK', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    console.log('✅ Order found in store');
    console.log(`User ID: ${orderData.userId || 'N/A'}`);
    console.log(`Amount: ₹${orderData.amount}`);
    console.log(`Has Token: ${!!orderData.token}`);

    // ============================================
    // STEP 2: Credit User Wallet
    // ============================================
    console.log('\n--- CREDITING WALLET ---');
    console.log('Calling backend deposit API...');

    try {
      const depositResponse = await fetch('https://ctbackend.crobstacle.com/api/wallet/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${orderData.token}`, // User's original token
        },
        body: JSON.stringify({
          amount: parseFloat(params.amount),
        }),
      });

      console.log(`Backend Response Status: ${depositResponse.status}`);

      if (depositResponse.ok) {
        const result = await depositResponse.json();
        console.log('✅ WALLET CREDITED SUCCESSFULLY');
        console.log('Backend Response:', result);
        console.log(`💰 ₹${params.amount} added to user's wallet`);
        
        // Delete order from store after successful processing
        console.log('\n--- CLEANING UP ---');
        deleteOrder(params.orderid);
        
      } else {
        const errorText = await depositResponse.text();
        console.error('❌ WALLET CREDIT FAILED');
        console.error(`Status: ${depositResponse.status}`);
        console.error(`Response: ${errorText}`);
        console.error('⚠️ Payment received but wallet not credited!');
        // Don't delete order - keep for debugging/retry
      }

    } catch (error) {
      console.error('❌ ERROR calling deposit API:');
      console.error(error);
      console.error('⚠️ Payment received but backend API call failed!');
      // Don't delete order - keep for debugging/retry
    }

    const processingTime = Date.now() - startTime;
    console.log('\n--- RESPONSE ---');
    console.log('✅ Responding with OK to payment gateway');
    console.log(`Processing time: ${processingTime}ms`);
    console.log('========================================\n');
    
    return new Response('OK', { 
      status: 200,
      headers: { 
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-store',
      }
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    console.error('\n========================================');
    console.error('❌ CALLBACK PROCESSING ERROR');
    console.error('========================================');
    console.error('Error details:');
    console.error(error);
    console.error(`Processing time: ${processingTime}ms`);
    console.error('========================================\n');
    
    return new Response('OK', { 
      status: 200,
      headers: { 
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-store',
      }
    });
  }
}

export async function GET() {
  return new Response(JSON.stringify({
    status: 'active',
    endpoint: '/api/payment/callback',
    method: 'POST',
    security: {
      ipWhitelist: ALLOWED_IP,
      signatureVerification: 'MD5',
      returnCodeCheck: '00',
    },
    description: 'Payment gateway callback endpoint with triple security checks',
    timestamp: new Date().toISOString(),
  }, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
