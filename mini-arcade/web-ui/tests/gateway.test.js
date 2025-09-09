import { sendMessage } from '../src/messaging/gateway';

test('sendMessage returns false for invalid message', () => {
  expect(sendMessage(null)).toBe(false);
});
