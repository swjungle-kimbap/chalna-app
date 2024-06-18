// add this import statement at the top of your `AppDelegate.m` file
#import "RNFBMessagingModule.h"

// in "(BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions" method
// Use `addCustomPropsToUserProps` to pass in props for initialization of your app
// Or pass in `nil` if you have none as per below example
// For `withLaunchOptions` please pass in `launchOptions` object
// and use it to set `self.initialProps` (available with react-native >= 0.71.1, older versions need a more difficult style, upgrading is recommended)

self.initialProps = [RNFBMessagingModule addCustomPropsToUserProps:nil withLaunchOptions:launchOptions];