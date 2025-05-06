#include <Arduino.h>
#include <HTTPClient.h>
#include <time.h>
#include "constants.h"
#include "config.h"
#include "telegram_handler.h"
#include "motor_handler.h"

String lastStatus = "";
boolean motorRunning = "";
unsigned long motorStartTime = 0;

String fetchStatus() {
  HTTPClient http;
  http.begin(String(FIREBASE_URL) + FIREBASE_STATUS_PATH);
  int httpCode = http.GET();
  String result = "";

  if (httpCode == 200) {
    result = http.getString();
    result.trim();
    result.replace("\"", "");
  }

  http.end();
  return result;
}

void setMotorState(const String& state, boolean startUpMotorState) {
  int pinState = (state.equalsIgnoreCase("ON")) ? LOW : HIGH;
  motorRunning = state.equalsIgnoreCase("ON");
  digitalWrite(MOTOR_LINE_A, pinState);
  digitalWrite(MOTOR_LINE_B, pinState);
  if (!startUpMotorState) {
    logMotorStatus(state);
  }
  if (motorRunning) {
    motorStartTime = millis();
  } else {
    motorStartTime = 0;
  }
}

void autoTurnOff(int autoTurnOffTime) {
  if (millis() - motorStartTime >= autoTurnOffTime) {
    turnOffMotor();
    readAndUpdateMotorStatus(false);
  }
}

void logMotorStatus(const String& status) {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("⚠️ Failed to obtain time");
    return;
  }

  char timeString[30];
  strftime(timeString, sizeof(timeString), "%Y-%m-%d %H:%M:%S", &timeinfo);

  // 2. Prepare JSON payload
  String payload = "{";
  payload += "\"status\": \"" + status + "\", ";
  payload += "\"time\": \"" + String(timeString) + "\"";
  payload += "}";

  // 3. POST to Firebase list (creates a unique push ID)
  HTTPClient http;
  String url = String(FIREBASE_URL) + "/motorHistory.json?auth=" + String(FIREBASE_AUTH);

  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  int httpCode = http.POST(payload);
  if (httpCode == 200) {
    Serial.println("✅ Motor status logged: " + payload);
  } else {
    Serial.println("⚠️ Failed to log motor status. HTTP code: " + String(httpCode));
  }
  http.end();
}

void readAndUpdateMotorStatus(const boolean startUpMotorState) {
  String currentStatus = fetchStatus();
  if (currentStatus != "" && currentStatus != lastStatus) {
    lastStatus = currentStatus;
    setMotorState(currentStatus, startUpMotorState);
    log("➡️ Polled: " + currentStatus);
  }
}

void turnOffMotor() {
  if (motorRunning) {
    HTTPClient http;
    String url = String(FIREBASE_URL) + "/status.json?auth=" + String(FIREBASE_AUTH);
    String payload = "\"OFF\"";  // Send the string "NO"

    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    int httpCode = http.PUT(payload);
    if (httpCode == 200) {
      log("✅ motor status set to OFF.");
    } else {
      log("⚠️ Failed to set motor status to OFF. HTTP code: " + String(httpCode));
    }
    http.end();
  }
}

int readAutoTurnOffTime() {
  HTTPClient http;
  http.begin(String(FIREBASE_URL) + FIREBASE_AUTO_TURN_OFF_TIME_PATH);
  int httpCode = http.GET();
  int value = 0;

  if (httpCode == 200) {
    String result = http.getString();
    result.trim();
    result.replace("\"", "");
    value = result.toInt();
  }

  http.end();
  return value;
}
