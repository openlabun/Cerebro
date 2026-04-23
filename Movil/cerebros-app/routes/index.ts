export const appRoutes = {
  home: '/index' as const,
  profile: '/profile' as const,
};

export const rootStackScreens = [
  {
    name: '(tabs)' as const,
    options: { headerShown: false },
  },
];
