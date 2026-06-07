package com.fitstreak.app;

import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Get the WebView from the Capacitor bridge and override the
        // WebChromeClient so that when the page requests microphone
        // access (for Web Speech API), we auto-grant it.
        getBridge().getWebView().setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                // Grant all requested resources (audio/video) from the WebView
                request.grant(request.getResources());
            }
        });
    }
}
