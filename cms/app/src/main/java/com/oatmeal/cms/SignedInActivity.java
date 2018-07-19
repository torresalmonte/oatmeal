package com.oatmeal.cms;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.design.widget.Snackbar;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ListView;
import android.widget.Toast;

import com.firebase.ui.auth.IdpResponse;
import com.firebase.ui.auth.util.ExtraConstants;
import com.firebase.ui.firestore.FirestoreRecyclerAdapter;
import com.firebase.ui.firestore.FirestoreRecyclerOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.FirebaseFirestoreException;
import com.google.firebase.firestore.Query;
import com.oatmeal.cms.adapter.TalkAdapter;
import com.oatmeal.cms.holder.TalkHolder;
import com.oatmeal.cms.model.Talk;

/**
 * Created by arturoraul on 7/17/18.
 */

public class SignedInActivity extends BaseActivity implements TalkAdapter.OnTalkSelectedListener {

    private static final String TAG = "SignedInActivity";

    private DatabaseReference mDatabase;
    private FirebaseAuth mAuth;
    private FirebaseFirestore mFirestore;
    private Query mQuery;
    private TalkAdapter mAdapter;

    private EditText mEmailField;
    private EditText mPasswordField;
    private Button mSignInButton;
    private Button mSignUpButton;

    private ViewGroup mEmptyView;;
    private RecyclerView mTalksRecycler;

    public static Intent createIntent(Context context, IdpResponse idpResponse) {
        return new Intent().setClass(context, SignedInActivity.class)
                .putExtra(ExtraConstants.IDP_RESPONSE, idpResponse);
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_sign_in);

        mAuth = FirebaseAuth.getInstance();
//        initFirestore();
        initRecyclerView();

        // Log.d(TAG, ">>>> " + mAuth.getCurrentUser().getUid());

    }

    private void initFirestore() {
        mFirestore = FirebaseFirestore.getInstance();

        // Get the 50 highest rated restaurants
        mQuery = mFirestore.collection("talks")
//                .orderBy("avgRating", Query.Direction.DESCENDING)
                .limit(50);
    }

    private void initRecyclerView() {
        mTalksRecycler = (RecyclerView) findViewById(R.id.talk_recycler_view);

        mTalksRecycler.setLayoutManager(new LinearLayoutManager(this));

        mFirestore = FirebaseFirestore.getInstance();

        mQuery = mFirestore.collection("talks")
//                .orderBy("avgRating", Query.Direction.DESCENDING)
                .limit(50);

        FirestoreRecyclerOptions<Talk> options = new FirestoreRecyclerOptions.Builder<Talk>()
                .setQuery(mQuery, Talk.class)
                .build();

        FirestoreRecyclerAdapter adapter = new FirestoreRecyclerAdapter<Talk, TalkHolder>(options) {
            @Override
            public void onBindViewHolder(TalkHolder holder, int position, Talk model) {

            }

            @Override
            public TalkHolder onCreateViewHolder(ViewGroup group, int i) {
                View view = LayoutInflater.from(group.getContext())
                        .inflate(R.layout.talk, group, false);
                return new TalkHolder(view);
            }
        };
    }

    @Override
    public void onTalkSelected(DocumentSnapshot talk) {
        Intent intent = new Intent(this, TalkDetailActivity.class);
        intent.putExtra(TalkDetailActivity.KEY_TALK_ID, talk.getId());

        startActivity(intent);
    }
}
