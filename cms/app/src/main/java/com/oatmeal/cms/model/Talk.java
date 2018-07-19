package com.oatmeal.cms.model;

import com.google.firebase.database.IgnoreExtraProperties;

import java.lang.reflect.Array;
import java.util.Date;

/**
 * Created by arturoraul on 7/18/18.
 */


@IgnoreExtraProperties
public class Talk {

    private String topic;
    private String duration;
    private String room;
    private Date date;
    private Array attendees;
    private Array speakers;

    public Talk() {}

    public Talk(String topic, String duration, Array attendees, Array speakers) {
        this.topic = topic;
        this.duration = duration;
        this.attendees = attendees;
        this.speakers = speakers;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getRoom() {
        return room;
    }

    public void setRoom(String room) {
        this.room = room;
    }

    public Date getTimestamp() { return date; }

    public void setTimestamp(Date date) { date = date; }

    public Array getAttendees() {
        return attendees;
    }

    public void setAttendees(Array attendees) {
        this.attendees = attendees;
    }

    public Array getSpeakers() {
        return speakers;
    }

    public void setSpeakers(Array speakers) {
        this.speakers = speakers;
    }
}
