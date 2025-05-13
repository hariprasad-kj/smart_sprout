#include <Arduino.h>
#include <HTTPClient.h>
#include "telegram_handler.h"
#include "config.h"

void log(const String &msg) {
  HTTPClient http;
  Serial.println("inside log message: " + msg);
  
  // URL-encode the message to ensure special characters don't break the URL
  String encodedMessage = "controller_log%3A%20" + urlencode(msg);
  
  // Construct the URL with the Bot Token and Chat ID
  String url = "https://api.telegram.org/bot" + String(BOT_TOKEN) + "/sendMessage?chat_id=" + String(CHAT_ID) + "&text=" + encodedMessage;

  // Start the HTTP request
  http.begin(url);
  
  // Send GET request
  int httpCode = http.GET();
  
  // Check if the request was successful
  if (httpCode > 0) {
    Serial.println("Message sent successfully to Telegram.");
  } else {
    Serial.print("Failed to send message. HTTP error code: ");
    Serial.println(httpCode);
  }

  http.end();
}

// Helper function to URL encode the message
String urlencode(const String &str) {
  String encoded = "";
  char c;
  for (int i = 0; i < str.length(); i++) {
    c = str.charAt(i);
    if (c == ' ') {
      encoded += "%20";
    } else if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9')) {
      encoded += c;
    } else {
      encoded += "%" + String(c, HEX);
    }
  }
  return encoded;
}