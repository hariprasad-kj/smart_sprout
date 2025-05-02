#ifndef CONFIG_H
#define CONFIG_H

#define WIFI_SSID "AirFiber-TS77Fi_EXT"
#define WIFI_PASSWORD "a12345678"
#define FIREBASE_URL "https://splash-75d85-default-rtdb.asia-southeast1.firebasedatabase.app"
#define FIREBASE_AUTH "CtR8kZphjGJ4vGClS14g4BbD9azbK9qfibwPXGHB"
#define FIREBASE_STATUS_PATH "/status.json?auth=" FIREBASE_AUTH
#define FIREBASE_UPDATE_FLAG_PATH "/otaUpdate.json?auth=" FIREBASE_AUTH
#define BOT_TOKEN "7715761765:AAH5ZKkJOO5tdWBxc8rnhKw-Y2W26hrI5VQ"
#define CHAT_ID "643776779"
#define FIRMWARE_URL "https://raw.githubusercontent.com/hariprasad-kj/smart_sprout/main/motor_controller.bin"
#define MOTOR_LINE_A 32
#define MOTOR_LINE_B 33
#define TRIGGER_PIN  23
#define ECHO_PIN     22

void setupPins();
void waitForTimeSync();
void completeSetup();

#endif