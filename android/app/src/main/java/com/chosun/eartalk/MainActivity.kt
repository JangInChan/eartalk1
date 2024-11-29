package com.chosun.eartalk

import android.os.Build
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint
import expo.modules.ReactActivityDelegateWrapper
import expo.modules.splashscreen.singletons.SplashScreen
import expo.modules.splashscreen.SplashScreenImageResizeMode

class MainActivity : ReactActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        // Splash Screen 설정
        SplashScreen.show(this, SplashScreenImageResizeMode.CONTAIN, false)
        super.onCreate(savedInstanceState)
    }

    /**
     * React Native JavaScript 메인 컴포넌트 이름 반환
     */
    override fun getMainComponentName(): String {
        return "main" // JavaScript에서 AppRegistry.registerComponent에 등록된 이름
    }

    /**
     * ReactActivityDelegate 인스턴스 생성
     * New Architecture 활성화와 Fabric 렌더러 설정 포함
     */
    override fun createReactActivityDelegate(): ReactActivityDelegate {
        return ReactActivityDelegateWrapper(
            this,
            BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
            DefaultReactActivityDelegate(
                this,
                mainComponentName,
                DefaultNewArchitectureEntryPoint.fabricEnabled
            )
        )
    }

    /**
     * Android S와의 Back 버튼 동작 정렬
     */
    override fun invokeDefaultOnBackPressed() {
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
            if (!moveTaskToBack(false)) {
                super.invokeDefaultOnBackPressed()
            }
        } else {
            super.invokeDefaultOnBackPressed()
        }
    }
}
