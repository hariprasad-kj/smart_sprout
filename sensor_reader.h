#ifndef SENSOR_READER_H
#define SENSOR_READER_H

void sendWaterDataToFirebase(float waterLevel, float waterPercentage, float waterVolume);
void readSensor();

#endif