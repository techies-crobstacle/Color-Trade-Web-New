// import crypto from 'crypto';

// const API_KEY = process.env.WITHDRAWAL_API_KEY || '';

// function verifySign(params: any, receivedSign: string): boolean {
//   // Exclude sign and remarks (if null) from signature
//   const signParams = Object.keys(params)
//     .filter(key => key !== 'sign' && (key !== 'remarks' || params.remarks))
//     .sort()
//     .map(key => `${key}=${params[key]}`)
//     .join('&') + `&key=${API_KEY}`;
  
//   const calculatedSign = crypto.createHash('md5').update(signParams).digest('hex').toUpperCase();
//   return calculatedSign === receivedSign;
// }

// export async function POST(request: Request) {
//   console.log('\n========================================');
//   console.log('🔔 WITHDRAWAL CALLBACK RECEIVED');
//   console.log('========================================\n');
  
//   try {
//     let params: any = {};
    
//     const contentType = request.headers.get('content-type');
    
//     if (contentType?.includes('application/json')) {
//       params = await request.json();
//     } else {
//       const formData = await request.formData();
//       params = Object.fromEntries(formData);
//     }

//     console.log('Callback data:', params);

//     const { orderId, status, remarks, amount, sign } = params;

//     // Verify signature
//     if (!verifySign(params, sign)) {
//       console.error('❌ Signature verification failed');
//       return new Response('FAIL', { status: 400 });
//     }

//     console.log('✅ Signature verified');

//     if (status === 'processed') {
//       console.log('✅ Withdrawal successful');
//       console.log(`Order: ${orderId}, Amount: ₹${amount}, UTR: ${remarks}`);
      
//       // Update withdrawal status in database
//       try {
//         const token = process.env.BACKEND_API_TOKEN;
//         await fetch('https://ctbackend.crobstacle.com/api/withdrawals/update', {
//           method: 'PUT',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//             orderId,
//             status: 'completed',
//             utr: remarks,
//             completedAt: new Date().toISOString(),
//           }),
//         });
//         console.log('💰 Withdrawal marked as completed');
//       } catch (error) {
//         console.error('Backend update error:', error);
//       }
//     } else if (status === 'failed') {
//       console.log('❌ Withdrawal failed');
//       console.log(`Reason: ${remarks || 'Unknown'}`);
      
//       // Update as failed and refund
//       try {
//         const token = process.env.BACKEND_API_TOKEN;
//         await fetch('https://ctbackend.crobstacle.com/api/withdrawals/update', {
//           method: 'PUT',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//             orderId,
//             status: 'failed',
//             failReason: remarks,
//             refunded: true,
//           }),
//         });
//         console.log('💸 Withdrawal marked as failed, funds refunded');
//       } catch (error) {
//         console.error('Backend update error:', error);
//       }
//     }

//     console.log('✅ Responding with OK');
//     console.log('========================================\n');

//     return new Response('OK', { 
//       status: 200,
//       headers: { 'Content-Type': 'text/plain' }
//     });

//   } catch (error) {
//     console.error('❌ Callback error:', error);
//     return new Response('ERROR', { status: 500 });
//   }
// }





// import crypto from 'crypto';

// const API_KEY = process.env.WITHDRAWAL_API_KEY || '';

// function verifySign(params: any, receivedSign: string): boolean {
//   const signParams = Object.keys(params)
//     .filter(key => key !== 'sign' && (key !== 'remarks' || params.remarks))
//     .sort()
//     .map(key => `${key}=${params[key]}`)
//     .join('&') + `&key=${API_KEY}`;
  
//   const calculatedSign = crypto.createHash('md5').update(signParams).digest('hex').toUpperCase();
//   return calculatedSign === receivedSign;
// }

// export async function POST(request: Request) {
//   console.log('\n========================================');
//   console.log('🔔 WITHDRAWAL CALLBACK RECEIVED');
//   console.log('========================================\n');
  
//   try {
//     let params: any = {};
    
//     const contentType = request.headers.get('content-type');
    
//     if (contentType?.includes('application/json')) {
//       params = await request.json();
//     } else {
//       const formData = await request.formData();
//       params = Object.fromEntries(formData);
//     }

//     console.log('Callback data:', params);

//     const { orderId, status, remarks, amount, sign } = params;

//     // Verify signature
//     if (!verifySign(params, sign)) {
//       console.error('❌ Signature verification failed');
//       return new Response('FAIL', { status: 400 });
//     }

//     console.log('✅ Signature verified');

//     if (status === 'processed') {
//       console.log('✅ Withdrawal successful');
//       console.log(`Order: ${orderId}, Amount: ₹${amount}, UTR: ${remarks}`);
//     } else if (status === 'failed') {
//       console.log('❌ Withdrawal failed');
//       console.log(`Reason: ${remarks || 'Unknown'}`);
//     }

//     console.log('✅ Responding with OK');
//     console.log('========================================\n');

//     return new Response('OK', { 
//       status: 200,
//       headers: { 'Content-Type': 'text/plain' }
//     });

//   } catch (error) {
//     console.error('❌ Callback error:', error);
//     return new Response('ERROR', { status: 500 });
//   }
// }



import crypto from 'crypto';

const API_KEY = process.env.WITHDRAWAL_API_KEY || '';

interface WithdrawalCallback {
  orderId: string;
  status: string;
  remarks?: string;
  amount: string;
  sign: string;
}

function verifySign(params: WithdrawalCallback, receivedSign: string): boolean {
  const signParams = Object.keys(params)
    .filter(key => key !== 'sign' && (key !== 'remarks' || params.remarks))
    .sort()
    .map(key => `${key}=${params[key as keyof WithdrawalCallback]}`)
    .join('&') + `&key=${API_KEY}`;
  
  const calculatedSign = crypto.createHash('md5').update(signParams).digest('hex').toUpperCase();
  return calculatedSign === receivedSign;
}

export async function POST(request: Request) {
  console.log('\n========================================');
  console.log('🔔 WITHDRAWAL CALLBACK RECEIVED');
  console.log('========================================\n');
  
  try {
    let params: WithdrawalCallback;
    
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      params = await request.json() as WithdrawalCallback;
    } else {
      const formData = await request.formData();
      // Convert FormDataEntryValue to string
      const entries = Object.fromEntries(formData);
      params = {
        orderId: String(entries.orderId || ''),
        status: String(entries.status || ''),
        remarks: entries.remarks ? String(entries.remarks) : undefined,
        amount: String(entries.amount || ''),
        sign: String(entries.sign || ''),
      };
    }

    console.log('Callback data:', params);

    const { orderId, status, remarks, amount, sign } = params;

    // Verify signature
    if (!verifySign(params, sign)) {
      console.error('❌ Signature verification failed');
      return new Response('FAIL', { status: 400 });
    }

    console.log('✅ Signature verified');

    if (status === 'processed') {
      console.log('✅ Withdrawal successful');
      console.log(`Order: ${orderId}, Amount: ₹${amount}, UTR: ${remarks}`);
    } else if (status === 'failed') {
      console.log('❌ Withdrawal failed');
      console.log(`Reason: ${remarks || 'Unknown'}`);
    }

    console.log('✅ Responding with OK');
    console.log('========================================\n');

    return new Response('OK', { 
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });

  } catch (error) {
    console.error('❌ Callback error:', error);
    return new Response('ERROR', { status: 500 });
  }
}
