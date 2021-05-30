import amqp from 'amqp-connection-manager';
// import amqp from 'amqplib/callback_api'
import event from 'events';

const listener = new event.EventEmitter();

function connectRabbit() {
  const connection = amqp.connect(['amqp://rabbitmq:rabbitmq@139.59.107.94:5672'], {
    heartbeatIntervalInSeconds: 10,
    
  });
  connection.on('connect', () => console.log('[AMQP] conn connected'));
  const queue = 'job_queue';
  const channelWrapper = connection.createChannel({
    setup: function (channel) {
      // `channel` here is a regular amqplib `ConfirmChannel`.
      // Note that `this` here is the channelWrapper instance.
      
      return channel.assertQueue(queue, { durable: true });
    },
  });
  
  listener.on('sendMessage', (msg) => {
    console.log('receive');
    channelWrapper
      .sendToQueue(queue, Buffer.from(msg))
      .then(function () {
        return console.log(' [x] Sent %s', msg);
      })
      .catch(function (err) {
        return console.log('Message was rejected...!');
      });
  });
}

// async function connectRabbit() {
//   amqp.connect(
//     {
//       hostname: '13.67.37.61',
//       username: 'rabbitmq',
//       password: 'rabbitmq',
//       heartbeat: 5,
//     },
//     function (error0, connection) {
//       if (error0) {
//         console.log('[AMQP] conn error' + error0.message);
//         console.log('[AMQP] reconnecting');
//         setTimeout(connectRabbit, 1000);

//         return;
//       }
//       console.log('[AMQP] conn connected');

//       connection.createChannel(function (error1, channel) {
//         if (error1) {
//           throw error1;
//         }
//         var queue = 'job_queue';

//         channel.assertQueue(queue, {
//           durable: true,
//         });
//         channel.prefetch(1);
//         listener.on('sendMessage', (msg) => {
//           channel.sendToQueue(queue, Buffer.from(msg));
//           console.log(' [x] Sent %s', msg);
//         });
//       });
//       connection.on('error', function (err) {
//         if (err.message !== 'Connection closing') {
//           console.error('[AMQP] conn error', err.message);
//         }
//       });

//       connection.on('close', function () {
//         console.error('[AMQP] reconnecting');
//         setTimeout(connectRabbit, 1000);
//       });
//     },
//   );
// }
export { connectRabbit, listener };
