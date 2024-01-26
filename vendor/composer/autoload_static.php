<?php

// autoload_static.php @generated by Composer

namespace Composer\Autoload;

class ComposerStaticInit2e81f436193da5b40f951c6849eda663
{
    public static $prefixLengthsPsr4 = array (
        'F' => 
        array (
            'Firebase\\JWT\\' => 13,
        ),
    );

    public static $prefixDirsPsr4 = array (
        'Firebase\\JWT\\' => 
        array (
            0 => __DIR__ . '/..' . '/firebase/php-jwt/src',
        ),
    );

    public static $classMap = array (
        'Composer\\InstalledVersions' => __DIR__ . '/..' . '/composer/InstalledVersions.php',
    );

    public static function getInitializer(ClassLoader $loader)
    {
        return \Closure::bind(function () use ($loader) {
            $loader->prefixLengthsPsr4 = ComposerStaticInit2e81f436193da5b40f951c6849eda663::$prefixLengthsPsr4;
            $loader->prefixDirsPsr4 = ComposerStaticInit2e81f436193da5b40f951c6849eda663::$prefixDirsPsr4;
            $loader->classMap = ComposerStaticInit2e81f436193da5b40f951c6849eda663::$classMap;

        }, null, ClassLoader::class);
    }
}