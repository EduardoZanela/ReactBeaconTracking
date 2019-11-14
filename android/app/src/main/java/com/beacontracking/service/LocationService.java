package com.beacontracking.service;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import com.beacontracking.BeaconDTO;
import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;

import org.altbeacon.beacon.Beacon;
import org.altbeacon.beacon.Region;

import java.util.ArrayList;
import java.util.Collection;

import javax.annotation.Nullable;

public class LocationService extends HeadlessJsTaskService {
    @Nullable
    protected HeadlessJsTaskConfig getTaskConfig(Intent intent) {
        Bundle extra = intent.getBundleExtra("extra");
        ArrayList<BeaconDTO> objects = (ArrayList<BeaconDTO>) extra.getSerializable("data");

        return new HeadlessJsTaskConfig(
                "SAVE_LOCATION",
                 createRangingResponse(objects),
                5000,
                true);
    }

    private WritableMap createRangingResponse(ArrayList<BeaconDTO>  beacons) {

        WritableMap map = new WritableNativeMap();
        WritableArray a = new WritableNativeArray();

        for (BeaconDTO beacon : beacons) {
            WritableMap b = new WritableNativeMap();

            if (beacon.getUuid() != null) {
                b.putInt("major", beacon.getMajor());
                b.putInt("minor", beacon.getMinor());
                b.putString("uuid", beacon.getUuid());
            } else{
                b.putString("namespaceId", beacon.getNamespaceId());
                b.putString("instanceId", beacon.getInstanceId());
            }
            b.putInt("rssi", beacon.getRssi());
            b.putDouble("distance", beacon.getDistance());
            a.pushMap(b);
        }

        map.putArray("beacons", a);
        return map;
    }
}
