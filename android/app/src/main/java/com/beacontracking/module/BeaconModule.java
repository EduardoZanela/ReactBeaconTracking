package com.beacontracking.module;

import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.RemoteException;
import android.util.Log;

import com.beacontracking.constants.Event;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.altbeacon.beacon.Beacon;
import org.altbeacon.beacon.BeaconConsumer;
import org.altbeacon.beacon.BeaconManager;
import org.altbeacon.beacon.BeaconParser;
import org.altbeacon.beacon.Identifier;
import org.altbeacon.beacon.RangeNotifier;
import org.altbeacon.beacon.Region;
import org.altbeacon.beacon.powersave.BackgroundPowerSaver;

import java.util.Collection;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

public class BeaconModule extends ReactContextBaseJavaModule implements BeaconConsumer, RangeNotifier {

    private static final String MODULE_NAME = "BeaconModule";
    private static final String LOG_TAG = "BeaconModule";
    private static final String IBEACON = "m:0-3=4c000215,i:4-19,i:20-21,i:22-23,p:24-24";
    private static final String ESTIMOTE_DEFAULT = "m:2-3=0215,i:4-19,i:20-21,i:22-23,p:24-24";

    private ReactApplicationContext mReactContext;
    private Context mApplicationContext;
    private BeaconManager mBeaconManager;
    private BackgroundPowerSaver backgroundPowerSaver;

    public BeaconModule(@Nonnull ReactApplicationContext reactContext) {
        super(reactContext);
        Log.d(LOG_TAG, "started");
        this.mReactContext = reactContext;
    }

    @Override
    public void initialize() {
        super.initialize();

        // USING ALTBEACON SDK
        this.mApplicationContext = this.mReactContext.getApplicationContext();
        this.mBeaconManager = BeaconManager.getInstanceForApplication(this.mApplicationContext);

        // Detect the main identifier (UID) frame:
        mBeaconManager.getBeaconParsers().add(new BeaconParser().setBeaconLayout(IBEACON));
        mBeaconManager.getBeaconParsers().add(new BeaconParser().setBeaconLayout(ESTIMOTE_DEFAULT));
        mBeaconManager.getBeaconParsers().add(new BeaconParser().setBeaconLayout(BeaconParser.EDDYSTONE_UID_LAYOUT));

        // Period between scans it will wait 5 seconds to scan again
        mBeaconManager.setForegroundBetweenScanPeriod(60000);
        // Period between background scans it will wait 1 minute to scan again
        mBeaconManager.setBackgroundBetweenScanPeriod(60000);

        // Simply constructing this class and holding a reference to it in your custom Application class
        // enables auto battery saving of about 60%
        backgroundPowerSaver = new BackgroundPowerSaver(this.mApplicationContext);
        bindManager();
    }

    public void bindManager() {
        if (!mBeaconManager.isBound(this)) {
            Log.d(LOG_TAG, "bindManager");
            mBeaconManager.bind(this);
        }
    }

    @Nonnull
    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @Override
    public void onBeaconServiceConnect() {
        // Add ranging notifier
        mBeaconManager.addRangeNotifier(this);
        sendEvent(mReactContext, Event.EVENT_BEACON_SERVICE_CONNECTED, null);
    }

    @Override
    public void didRangeBeaconsInRegion(Collection<Beacon> beacons, Region region) {
        Log.d(LOG_TAG, " Time setled " + mBeaconManager.getForegroundBetweenScanPeriod());
        for (Beacon beacon: beacons) {
            // if is a eddystone protocol
            if (beacon.getServiceUuid() == 0xfeaa && beacon.getBeaconTypeCode() == 0x00) {

                // This is a Eddystone-UID frame
                Identifier namespaceId = beacon.getId1();
                Identifier instanceId = beacon.getId2();

                Log.d(LOG_TAG, "I see a beacon transmitting namespace id: " + namespaceId +
                        " and instance id: " + instanceId +
                        " approximately " + beacon.getDistance() + " meters away.");
                sendEvent(mReactContext, Event.EVENT_BEACONS_DID_RANGE, createRangingResponse(beacons, region));
            }
        }
    }

    @Override
    public Context getApplicationContext() {
        return this.mApplicationContext;
    }

    @Override
    public void unbindService(ServiceConnection serviceConnection) {
        mApplicationContext.unbindService(serviceConnection);
    }

    @Override
    public boolean bindService(Intent intent, ServiceConnection serviceConnection, int i) {
        return mApplicationContext.bindService(intent, serviceConnection, i);
    }

    private void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
        if (reactContext.hasActiveCatalystInstance()) {
            reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
        }
    }

    private WritableMap createRangingResponse(Collection<Beacon> beacons, Region region) {

        WritableMap map = new WritableNativeMap();
        map.putString("region", region.getUniqueId());

        WritableArray a = new WritableNativeArray();

        for (Beacon beacon : beacons) {
            WritableMap b = new WritableNativeMap();

            if (beacon.getIdentifiers().size() > 2) {
                b.putInt("major", beacon.getId2().toInt());
                b.putInt("minor", beacon.getId3().toInt());
                b.putString("uuid", beacon.getId1().toString());
            } else{
                b.putString("namespaceId", beacon.getId1().toString());
                b.putString("instanceId", beacon.getId2().toString());
            }
            b.putInt("rssi", beacon.getRssi());
            b.putDouble("distance", beacon.getDistance());
            a.pushMap(b);
        }

        map.putArray("beacons", a);
        return map;
    }

    @ReactMethod
    public void startRanging(Callback resolve, Callback reject) {
        Log.d(LOG_TAG, "startRanging for any region");

        Region region = new Region("beacon_tracking_region", null, null, null);
        try {
            mBeaconManager.startRangingBeaconsInRegion(region);
            resolve.invoke();
        } catch (RemoteException e) {
            Log.e(LOG_TAG, "error occurred on starts ranging " + e.getMessage(), e);
            reject.invoke(e.getMessage());
        }
    }

    @ReactMethod
    public void setBackgroundScanPeriod(int period) {
        mBeaconManager.setBackgroundScanPeriod((long) period);
    }

    @ReactMethod
    public void setBackgroundBetweenScanPeriod(int period) {
        mBeaconManager.setBackgroundBetweenScanPeriod((long) period);
    }

    @ReactMethod
    public void setForegroundScanPeriod(int period) {
        mBeaconManager.setForegroundScanPeriod((long) period);
    }

    @ReactMethod
    public void setForegroundBetweenScanPeriod(int period) {
        mBeaconManager.setForegroundBetweenScanPeriod((long) period);
        Log.d(LOG_TAG, "Time received: " + period + " Time seted " + mBeaconManager.getForegroundBetweenScanPeriod());

    }
}
