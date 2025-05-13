#include <Arduino.h>
#include <HttpClient.h>
#include "constants.h"
#include "config.h"
#include "telegram_handler.h"
#include "firebase_handler.h"

float previousLevel = 0;
const int thresholdDelta = 5;

void sendWaterDataToFirebase(float waterLevel, float waterPercentage, float waterVolume)
{
  if (abs(waterLevel - previousLevel) >= thresholdDelta)
  {
    previousLevel = waterLevel;
    String url = String(FIREBASE_URL) + "/waterData.json?auth=" + String(FIREBASE_AUTH);
    String payload = "{\"level\": " + String(waterLevel, 2) + ", \"percentage\": " + String(waterPercentage, 2) + ", \"volume\": " + String(waterVolume, 2) + "}";
    updateValue(url, payload, "Water Level: " + String(waterLevel, 2) + " cm, Water Percentage: " + String(waterPercentage, 2) + " %, Water Volume: " + String(waterVolume, 2) + " liters", "Failed to update Firebase.");
  }
  else
  {
    log("No significant change... Not saving, water Level: " + String(waterLevel, 2));
  }
}

void readSensor(float tankHeight)
{
  long duration[NUM_READINGS];   // Array to store durations
  float distances[NUM_READINGS]; // Array to store distances
  float sum = 0;
  float averageDistance = 0;

  // Take multiple readings
  for (int i = 0; i < NUM_READINGS; i++)
  {
    // Send a clean pulse to trigger the sensor
    digitalWrite(TRIGGER_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIGGER_PIN, HIGH);
    delayMicroseconds(10); // 10 µs high pulse to trigger sensor
    digitalWrite(TRIGGER_PIN, LOW);

    // Measure the pulse duration on the Echo pin
    duration[i] = pulseIn(ECHO_PIN, HIGH); // Measure the time taken for the echo to return

    // Calculate the distance in centimeters
    if (duration[i] > 0)
    {
      distances[i] = (duration[i] / 2.0) / 29.1; // Speed of sound is 29.1 µs/cm
      // Only keep distances less than MAX_DISTANCE
      if (distances[i] > MAX_DISTANCE)
      {
        distances[i] = -1; // Mark as invalid if distance exceeds max threshold
      }
    }
    else
    {
      distances[i] = -1; // Invalid reading
    }

    delay(200); // Increased delay to give time for sensor to stabilize between readings
  }

  // Calculate the average distance
  int validCount = 0;
  sum = 0;
  for (int i = 0; i < NUM_READINGS; i++)
  {
    if (distances[i] > 0)
    { // Only consider valid readings
      sum += distances[i];
      validCount++;
    }
  }

  if (validCount > 0)
  {
    averageDistance = sum / validCount;

    // Calculate water level height
    float waterLevelHeight = tankHeight - averageDistance; // in cm

    // Calculate percentage of water
    float waterPercentage = (waterLevelHeight / tankHeight) * 100.0;

    // Calculate volume of water in cm³
    float waterVolume = waterLevelHeight * TANK_LENGTH * TANK_BREADTH; // in cm³

    // Convert volume to liters
    float waterVolumeLiters = waterVolume / 1000.0; // in liters

    // Send the water data to Firebase
    sendWaterDataToFirebase(waterLevelHeight, waterPercentage, waterVolumeLiters);
  }
  else
  {
    Serial.println("No valid readings");
  }
}

float readTankHeight()
{
  String tankHeight = getValue(String(FIREBASE_URL) + FIREBASE_TANK_HEIGHT_PATH, "readTankHeight() in sensor_reader");
  if (tankHeight.isEmpty())
  {
    return 0;
  }
  return tankHeight.toFloat();
}