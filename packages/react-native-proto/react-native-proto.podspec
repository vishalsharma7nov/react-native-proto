require('../metro/podspec.rb') if false

Pod::Spec.new do |s|
  s.name         = "react-native-proto"
  s.version      = "0.1.0"
  s.summary      = "Native HTTP+protobuf gRPC bridge for react-native-proto"
  s.homepage     = "https://github.com/vishalsharma7nov/react-native-proto"
  s.license      = "MIT"
  s.authors      = "vishalsharma7nov"
  s.platforms    = { :ios => "13.0" }
  s.source       = { :git => "https://github.com/vishalsharma7nov/react-native-proto.git", :tag => "v#{s.version}" }
  # Includes ios/ReactNativeProtoNativeGrpc.m (NSURLSession unary)
  s.source_files = "ios/**/*.{h,m,mm,swift}"
  s.dependency "React-Core"
end
