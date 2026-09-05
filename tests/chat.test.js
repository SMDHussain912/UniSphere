const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { generateToken } = require('../utils/generateToken');

jest.setTimeout(300000);

const MONGO_URL =
  process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/unisphere_test_chat';

let users;
let tokens;

const createUser = (firstname, phone, email) =>
  User.create({
    fullname: { firstname, lastname: 'UniSphere' },
    email: email || `${firstname.toLowerCase()}@unisphere.com`,
    phone,
    dob: '1990-01-01',
    gender: 'Other',
    qualification: 'Degree',
    password: 'Test@1234',
    role: 'user',
  });

beforeAll(async () => {
  await mongoose.connect(MONGO_URL, { family: 4 });
  await Promise.all([User, Conversation, Message].map((model) => model.init()));
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Conversation.deleteMany({}), Message.deleteMany({})]);
  const [alice, bob, carol] = await Promise.all([
    createUser('Alice', '9110000001', 'alice@chat.com'),
    createUser('Bob', '9110000002', 'bob@chat.com'),
    createUser('Carol', '9110000003', 'carol@chat.com'),
  ]);
  users = { alice, bob, carol };
  tokens = {
    alice: generateToken(alice),
    bob: generateToken(bob),
    carol: generateToken(carol),
  };
});

describe('Chat Gateway', () => {
describe('conversations', () => {
    it('requires authentication', async () => {
      const res = await request(app).get('/api/v1/chat/conversations');
      expect(res.status).toBe(401);
    });

    it('starts a conversation with another user', async () => {
      const res = await request(app)
        .post('/api/v1/chat/conversations')
        .set('Authorization', `Bearer ${tokens.alice}`)
        .send({ participantId: users.bob._id });
      expect(res.status).toBe(200);
      expect(res.body.data.participant._id).toBe(String(users.bob._id));
      expect(res.body.data.participant.email).toBeUndefined();
    });

    it('returns the same conversation for the same pair and rejects self-DM', async () => {
      const create = () =>
        request(app)
          .post('/api/v1/chat/conversations')
          .set('Authorization', `Bearer ${tokens.alice}`)
          .send({ participantId: users.bob._id });
      const first = await create();
      const second = await create();
      expect(first.body.data._id).toBe(second.body.data._id);

      const selfRes = await request(app)
        .post('/api/v1/chat/conversations')
        .set('Authorization', `Bearer ${tokens.alice}`)
        .send({ participantId: users.alice._id });
      expect(selfRes.status).toBe(400);
    });

    it('lists only the user conversations with the other participant populated', async () => {
      await request(app)
        .post('/api/v1/chat/conversations')
        .set('Authorization', `Bearer ${tokens.alice}`)
        .send({ participantId: users.bob._id });
      await request(app)
        .post('/api/v1/chat/conversations')
        .set('Authorization', `Bearer ${tokens.alice}`)
        .send({ participantId: users.carol._id });

      const res = await request(app)
        .get('/api/v1/chat/conversations')
        .set('Authorization', `Bearer ${tokens.bob}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].participant.fullname.firstname).toBe('Alice');

      const carolRes = await request(app)
        .get('/api/v1/chat/conversations')
        .set('Authorization', `Bearer ${tokens.carol}`);
      expect(carolRes.body.data.length).toBe(1);
      expect(carolRes.body.data[0].participant.fullname.firstname).toBe('Alice');
    });
  });
describe('messaging', () => {
    let conversationId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/chat/conversations')
        .set('Authorization', `Bearer ${tokens.alice}`)
        .send({ participantId: users.bob._id });
      conversationId = res.body.data._id;
    });

    it('sends a message and updates the conversation preview', async () => {
      const res = await request(app)
        .post(`/api/v1/chat/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${tokens.alice}`)
        .send({ content: 'Hello Bob! <script>alert(1)</script>' });
      expect(res.status).toBe(201);
      expect(res.body.data.fromMe).toBe(true);
      expect(res.body.data.content).toContain('Hello Bob!');

      const conv = await Conversation.findById(conversationId);
      expect(conv.lastMessage).toBe('Hello Bob! <script>alert(1)</script>');

      const list = await request(app)
        .get('/api/v1/chat/conversations')
        .set('Authorization', `Bearer ${tokens.bob}`);
      expect(list.body.data[0].lastMessage).toContain('Hello Bob!');
    });

    it('flags messages with fromMe relative to each participant', async () => {
      await request(app)
        .post(`/api/v1/chat/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${tokens.alice}`)
        .send({ content: 'first' });
      await request(app)
        .post(`/api/v1/chat/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${tokens.bob}`)
        .send({ content: 'second' });

      const aliceView = await request(app)
        .get(`/api/v1/chat/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${tokens.alice}`);
      expect(aliceView.body.data.map((m) => [m.content, m.fromMe])).toEqual([
        ['first', true],
        ['second', false],
      ]);

      const bobView = await request(app)
        .get(`/api/v1/chat/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${tokens.bob}`);
      expect(bobView.body.data.map((m) => [m.content, m.fromMe])).toEqual([
        ['first', false],
        ['second', true],
      ]);
    });

    it('rejects non-participants from reading or sending', async () => {
      const read = await request(app)
        .get(`/api/v1/chat/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${tokens.carol}`);
      expect(read.status).toBe(403);

      const send = await request(app)
        .post(`/api/v1/chat/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${tokens.carol}`)
        .send({ content: 'nope' });
      expect(send.status).toBe(403);
    });

    it('rejects empty messages', async () => {
      const res = await request(app)
        .post(`/api/v1/chat/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${tokens.alice}`)
        .send({ content: '   ' });
      expect(res.status).toBe(400);
    });
  });
});