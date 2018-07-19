package com.oatmeal.cms.adapter;

import android.content.res.Resources;
import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import com.bumptech.glide.Glide;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.Query;
import com.oatmeal.cms.R;
import com.oatmeal.cms.model.Talk;

/**
 * Created by arturoraul on 7/18/18.
 */

public class TalkAdapter extends FirestoreAdapter<TalkAdapter.ViewHolder> {

    public interface OnTalkSelectedListener {

        void onTalkSelected(DocumentSnapshot talk);

    }

    private OnTalkSelectedListener mListener;

    public TalkAdapter(Query query, OnTalkSelectedListener listener) {
        super(query);
        mListener = listener;
    }

    @Override
    public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        LayoutInflater inflater = LayoutInflater.from(parent.getContext());
        return new ViewHolder(inflater.inflate(R.layout.item_talk, parent, false));
    }

    @Override
    public void onBindViewHolder(ViewHolder holder, int position) {
        holder.bind(getSnapshot(position), mListener);
    }

    static class ViewHolder extends RecyclerView.ViewHolder {

        private ImageView imageView;
        private TextView topicView;
        private TextView durationView;

        public ViewHolder(View itemView) {
            super(itemView);
        }

        public void bind(final DocumentSnapshot snapshot,
                         final OnTalkSelectedListener listener) {

            Talk talk = snapshot.toObject(Talk.class);
            Resources resources = itemView.getResources();

            topicView.setText(talk.getTopic());
            durationView.setText(talk.getDuration());

            // Click listener
            itemView.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    if (listener != null) {
                        listener.onTalkSelected(snapshot);
                    }
                }
            });
        }

    }
}