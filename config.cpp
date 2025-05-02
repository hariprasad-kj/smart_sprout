#include <Arduino.h>
#include <WiFi.h>
#include "config.h"
#include "telegram_handler.h"

int retryCount = 0;

void setupPins() {
  pinMode(TRIGGER_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(MOTOR_LINE_A, OUTPUT);
  pinMode(MOTOR_LINE_B, OUTPUT);
  digitalWrite(MOTOR_LINE_A, HIGH);
  digitalWrite(MOTOR_LINE_B, HIGH);
  digitalWrite(TRIGGER_PIN, LOW);  // Ensuring trigger is low initially
  delay(100);  // Give some time for the sensor to stabilize
}

void waitForTimeSync() {
  struct tm timeinfo;
  unsigned long startTime = millis();
  while (!getLocalTime(&timeinfo)) {
    if (millis() - startTime > 10000) break; // 10-second timeout
    delay(1000);
  }
  log("Wifi connected.. and time sync completed.");
}

void completeSetup() {
  // Wi-Fi connection with retry logic
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED && retryCount < 20) {
    delay(500);
    retryCount++;
  }

  if (WiFi.status() != WL_CONNECTED) {
    log("WiFi failed, rebooting...");
    ESP.restart();
  }
  // Time sync
  configTime(19800, 0, "pool.ntp.org", "time.nist.gov");
  waitForTimeSync();
}