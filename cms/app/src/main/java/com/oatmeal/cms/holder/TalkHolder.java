package com.oatmeal.cms.holder;

import android.content.Context;
import android.content.Intent;
import android.support.v7.widget.RecyclerView;
import android.view.View;
import android.widget.TextView;

import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;
import com.oatmeal.cms.R;
import com.oatmeal.cms.TalkDetailActivity;
import com.oatmeal.cms.model.Talk;

import java.util.ArrayList;

/**
 * Created by arturoraul on 7/18/18.
 */

public class TalkHolder extends RecyclerView.ViewHolder implements View.OnClickListener {
    private static final int MAX_WIDTH = 200;
    private static final int MAX_HEIGHT = 200;

    View mView;
    Context mContext;

    public TalkHolder(View itemView) {
        super(itemView);
        mView = itemView;
        mContext = itemView.getContext();
        itemView.setOnClickListener(this);
    }

    public void bindTalk(Talk talk) {
        TextView topicTalkView = mView.findViewById(R.id.topicTalkView);
        topicTalkView.setText(talk.getTopic());
    }

    @Override
    public void onClick(View view) {
        final ArrayList<Talk> talks = new ArrayList<>();
        DatabaseReference ref = FirebaseDatabase.getInstance().getReference("talks");
        ref.addListenerForSingleValueEvent(new ValueEventListener() {

            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                for (DataSnapshot snapshot : dataSnapshot.getChildren()) {
                    talks.add(snapshot.getValue(Talk.class));
                }

                int itemPosition = getLayoutPosition();

                Intent intent = new Intent(mContext, TalkDetailActivity.class);
                intent.putExtra("talks", talks);

                mContext.startActivity(intent);
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
            }
        });
    }
}