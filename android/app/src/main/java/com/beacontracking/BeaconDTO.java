package com.beacontracking;

import java.io.Serializable;

public class BeaconDTO implements Serializable {

    private Integer major;
    private Integer minor;
    private String uuid;
    private String namespaceId;
    private String instanceId;
    private Integer rssi;
    private Double distance;

    public BeaconDTO(Integer major, Integer minor, String uuid, Integer rssi, Double distance) {
        this.major = major;
        this.minor = minor;
        this.uuid = uuid;
        this.rssi = rssi;
        this.distance = distance;
    }

    public BeaconDTO(String namespaceId, String instanceId, Integer rssi, Double distance) {
        this.namespaceId = namespaceId;
        this.instanceId = instanceId;
        this.rssi = rssi;
        this.distance = distance;
    }

    public Integer getMajor() {
        return major;
    }

    public void setMajor(Integer major) {
        this.major = major;
    }

    public Integer getMinor() {
        return minor;
    }

    public void setMinor(Integer minor) {
        this.minor = minor;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getNamespaceId() {
        return namespaceId;
    }

    public void setNamespaceId(String namespaceId) {
        this.namespaceId = namespaceId;
    }

    public String getInstanceId() {
        return instanceId;
    }

    public void setInstanceId(String instanceId) {
        this.instanceId = instanceId;
    }

    public Integer getRssi() {
        return rssi;
    }

    public void setRssi(Integer rssi) {
        this.rssi = rssi;
    }

    public Double getDistance() {
        return distance;
    }

    public void setDistance(Double distance) {
        this.distance = distance;
    }
}
