import { RequestHandler } from "express";

interface SMSReminderRequest {
  phone: string;
  message: string;
  taskTitle: string;
  dueDate: string;
}

export const sendSMSReminder: RequestHandler = async (req, res) => {
  try {
    const { phone, message, taskTitle, dueDate }: SMSReminderRequest = req.body;

    console.log(`SMS Reminder - Phone: ${phone}, Task: ${taskTitle}, Due: ${dueDate}`);
    console.log(`Message: ${message}`);

    // In a real implementation, you would integrate with an SMS service like:
    // - Twilio
    // - AWS SNS
    // - TextLocal (for India)
    // - MSG91 (for India)
    
    // For demo purposes, we'll simulate the SMS sending
    // Here's an example of how you might integrate with Twilio:
    /*
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    */

    // For now, we'll just log it and return success
    // In production, you would actually send the SMS here
    
    res.json({
      success: true,
      message: "SMS reminder sent successfully",
      phone: phone,
      taskTitle: taskTitle,
      sentAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error sending SMS reminder:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send SMS reminder"
    });
  }
};

export const scheduleReminder: RequestHandler = async (req, res) => {
  try {
    const { taskId, title, dueDate, description } = req.body;
    
    // Calculate reminder date (1 day before due date)
    const dueDateObj = new Date(dueDate);
    const reminderDate = new Date(dueDateObj);
    reminderDate.setDate(reminderDate.getDate() - 1);
    
    const now = new Date();
    const timeUntilReminder = reminderDate.getTime() - now.getTime();
    
    // If reminder date is in the past or today, send immediately
    if (timeUntilReminder <= 0) {
      const message = `🚨 URGENT: Farm task "${title}" is due ${dueDate === now.toISOString().split('T')[0] ? 'TODAY' : 'OVERDUE'}! Please complete: ${description}`;
      
      // Send immediate SMS
      const smsResponse = await fetch('/api/send-sms-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: '+919985442209',
          message,
          taskTitle: title,
          dueDate
        })
      });
      
      return res.json({
        success: true,
        message: "Immediate reminder sent (task is due soon)",
        scheduledFor: "immediate"
      });
    }
    
    // Schedule reminder for 1 day before
    setTimeout(async () => {
      const message = `⏰ Reminder: Farm task "${title}" is due tomorrow (${dueDate}). Description: ${description}. Please prepare accordingly.`;
      
      try {
        await fetch('/api/send-sms-reminder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: '+919985442209',
            message,
            taskTitle: title,
            dueDate
          })
        });
        console.log(`Reminder sent for task: ${title}`);
      } catch (error) {
        console.error(`Failed to send reminder for task ${title}:`, error);
      }
    }, timeUntilReminder);
    
    res.json({
      success: true,
      message: "Reminder scheduled successfully",
      taskId,
      scheduledFor: reminderDate.toISOString(),
      timeUntilReminder: Math.round(timeUntilReminder / (1000 * 60 * 60)) + " hours"
    });
    
  } catch (error) {
    console.error("Error scheduling reminder:", error);
    res.status(500).json({
      success: false,
      error: "Failed to schedule reminder"
    });
  }
};
