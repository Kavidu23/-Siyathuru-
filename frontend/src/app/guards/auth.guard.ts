import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserService } from '../services/user.service';

type Role = 'member' | 'leader' | 'admin';

function isAllowed(user: any, roles: Role[]): boolean {
  if (!user) return false;
  if (!roles || roles.length === 0) return true;
  return roles.includes(user.role as Role);
}

export const authGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const userService = inject(UserService);
  const roles = (route.data?.['roles'] ?? []) as Role[];
  const unauthorizedMessage = route.data?.['unauthorizedMessage'] as string | undefined;

  const denyAccess = () => {
    if (unauthorizedMessage) {
      alert(unauthorizedMessage);
    }
    return router.createUrlTree(['/home']);
  };

  const currentUser = userService.getCurrentUser();
  if (currentUser) {
    return isAllowed(currentUser, roles) ? true : denyAccess();
  }

  return userService.validateSession().pipe(
    map((res: any) => {
      const user = res?.user || userService.getCurrentUser();
      return isAllowed(user, roles) ? true : denyAccess();
    }),
    catchError(() => of(denyAccess())),
  );
};
