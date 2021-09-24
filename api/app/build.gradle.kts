plugins {
    application
}

repositories {
    mavenCentral()
}

dependencies {
    runtimeOnly("org.slf4j:slf4j-api:1.7.32")
    runtimeOnly("org.slf4j:slf4j-simple:1.7.32")
    implementation("com.sparkjava:spark-core:2.9.3")
}

application {
    mainClass.set("me.mazeika.cs4550.api.App")
}
