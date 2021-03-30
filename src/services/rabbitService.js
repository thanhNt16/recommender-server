import amqp from 'amqplib/callback_api';
import event from 'events';

const listener = new event.EventEmitter();

async function connectRabbit() {
  try {
    await amqp.connect({
      hostname: '13.67.37.61',
      username: 'rabbitmq',
      password: 'rabbitmq'
    }, function (error0, connection) {
      if (error0) {
        throw error0;
      }
      connection.createChannel(function (error1, channel) {
        if (error1) {
          throw error1;
        }
        var queue = 'job_queue';

        channel.assertQueue(queue, {
          durable: true,
        });
        listener.on('sendMessage', (msg) => {
          channel.sendToQueue(queue, Buffer.from(msg));
          console.log(' [x] Sent %s', msg);
        });
      });
    });
  } catch (error) {
    console.log(error);
  }
}
export { connectRabbit, listener };
