package com.aething.aistore;

import android.os.Bundle;
import android.webkit.ServiceWorkerClient;
import android.webkit.ServiceWorkerController;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private WebView webView;
    private static final String BASE_URL = "https://ai-store-pwa.app"; // URL нашего PWA

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Создаем WebView программно
        webView = new WebView(this);
        setContentView(webView);
        
        // Настраиваем WebView для поддержки PWA
        configureWebView();
        
        // Загружаем PWA
        webView.loadUrl(BASE_URL);
    }

    private void configureWebView() {
        WebSettings webSettings = webView.getSettings();
        
        // Включаем JavaScript
        webSettings.setJavaScriptEnabled(true);
        
        // Включаем DOM Storage
        webSettings.setDomStorageEnabled(true);
        
        // Включаем работу с базами данных
        webSettings.setDatabaseEnabled(true);
        
        // Включаем App Cache
        webSettings.setAppCacheEnabled(true);
        
        // Устанавливаем режим кэширования
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
        
        // Включаем поддержку Service Workers
        if (ServiceWorkerController.getInstance() != null) {
            ServiceWorkerController swController = ServiceWorkerController.getInstance();
            swController.setServiceWorkerClient(new ServiceWorkerClient() {
                @Override
                public WebResourceResponse shouldInterceptRequest(WebResourceRequest request) {
                    return null; // Позволяем Service Worker обрабатывать запросы по умолчанию
                }
            });
        }
        
        // Настраиваем WebViewClient для обработки навигации внутри WebView
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                // Обрабатываем все URL в WebView
                return false;
            }
        });
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}