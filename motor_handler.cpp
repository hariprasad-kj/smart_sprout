#include <Arduino.h>
#include <HTTPClient.h>
#include "config.h"
#include "telegram_handler.h"

String lastStatus = "";

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

void setMotorState(const String& state) {
  int pinState = (state.equalsIgnoreCase("ON")) ? LOW : HIGH;
  digitalWrite(MOTOR_LINE_A, pinState);
  digitalWrite(MOTOR_LINE_B, pinState);
}

void readAndUpdateMotorStatus() {
  String currentStatus = fetchStatus();
  if (currentStatus != "" && currentStatus != lastStatus) {
    lastStatus = currentStatus;
    setMotorState(currentStatus);
    log("➡️ Polled: " + currentStatus);
  }
}
