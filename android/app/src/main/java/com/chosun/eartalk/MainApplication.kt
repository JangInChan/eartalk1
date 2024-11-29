package com.chosun.eartalk

import android.app.Application
import android.content.res.Configuration
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader
import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ReactNativeHostWrapper

class MainApplication : Application(), ReactApplication {

    // ReactNativeHost를 Wrapping하여 New Architecture와 호환되도록 설정
    override val reactNativeHost: ReactNativeHost = ReactNativeHostWrapper(
        this,
        object : DefaultReactNativeHost(this) {
            override fun getPackages(): List<ReactPackage> {
                val packages = PackageList(this).packages
                // 수동으로 추가할 패키지 예시:
                // packages.add(MyCustomReactPackage())
                return packages
            }

            // Metro Bundler를 위한 메인 JS 모듈 경로 설정
            override fun getJSMainModuleName(): String = ".expo/.virtual-metro-entry"

            // 디버그 설정
            override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

            // New Architecture와 Hermes 활성화 여부 설정
            override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
        }
    )

    // 앱 생성 시 초기화
    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this, /* native exopackage */ false)
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load()
        }
        ApplicationLifecycleDispatcher.onApplicationCreate(this)
    }

    // Configuration 변경 시 처리
    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
    }
}
