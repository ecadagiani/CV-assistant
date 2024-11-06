import { render } from '@react-email/render';
import BPromise from 'bluebird';
import nodemailer from 'nodemailer';
import React from 'react';
import { EMAIL_ADDRESS, EMAIL_APP_PASSWORD, EMAIL_APP_USER } from '../config.js';
import { TooManyEmailsSendedAtTime } from '../errors.js';
import Conversation from '../models/conversation.js';
import rateLimiters from '../rateLimiters.js';

import NewContactSimple from '../react-email/dist/NewContactSimple.js';

export async function createTransporter() {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: EMAIL_APP_USER,
      pass: EMAIL_APP_PASSWORD,
    },
  });
  return transporter;
}

export async function sendEmail(subject, html = '', text = '') {
  async function internalSendEmail() {
    const mailOptions = {
      from: EMAIL_ADDRESS,
      to: EMAIL_ADDRESS,
      subject,
    };
    if (html) {
      mailOptions.html = html;
    } else if (text) {
      mailOptions.text = text;
    }

    const transporter = await createTransporter();
    await transporter.sendMail(mailOptions);
  }

  // rate limit, of X sendEmail at second.
  try {
    await rateLimiters.sendEmail.consume();
    await internalSendEmail();
  } catch (error1) {
    if (error1 instanceof Error) throw error1;

    // Can't consume, wait 1s and retry
    await BPromise.delay(1000);
    try {
      await rateLimiters.sendEmail.consume(); // throw error if can't consume
      await internalSendEmail();
    } catch (error2) {
      if (error2 instanceof Error) throw error2;
      throw new TooManyEmailsSendedAtTime();
    }
  }
}

export async function sendContactSimpleMail(user, email, name, body) {
  // Fetch conversations, and populate messages
  const conversations = await Conversation
    .find({ user: user._id })
    .populate('messages')
    .sort({ createdAt: -1 })
    .exec();
  const rawConversations = conversations.map((conv) => ({
    ...conv.toObject(),
    user: undefined,
  }));
  const subject = `Webchat CV - Un nouveau message de ${name}`;
  const emailHtml = render(
    React.createElement(NewContactSimple, {
      email,
      name,
      body,
      userId: user._id.toString(),
      messages: rawConversations,
    }, null),
  );

  await sendEmail(subject, emailHtml);
}

export async function testMail() {
  await sendEmail('test_email-resume_assistant', '', 'Test email from resume-assistant');
}
