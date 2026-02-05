import { defineStore } from 'pinia'
import { authService } from '../api/auth.ts';

export const useUserStore = defineStore('user', {
    state: () => ({
        user: {
            id: null,
            name: null,
            email: null,
        },
        initialized: false,
        loading: false
    }),
    getters: {
        isAuthenticated(state) {
            return !!state.user.id;
        }
    },
    actions: {
        async init() {
            if (this.initialized) return;

            try {
                const userRequest = await authService.getUser();

                if (!userRequest) {
                    this.setEmptyUser();
                    return;
                }

                this.user = userRequest;
            } catch (error) {
                this.setEmptyUser();
                console.error(error);
            } finally {
                this.initialized = true;
            }
        },
        async checkAuth(){
            try {
                const userRequest= await authService.getUser();

                if (!userRequest) {
                    this.setEmptyUser();
                    return;
                }

                this.user = userRequest;

                return !!this.user.id;
            } catch (error) {
                this.setEmptyUser();
                console.error(error);
                return false;
            }
        },
        setEmptyUser() {
            this.user = {
                id: null,
                name: null,
                email: null,
            };
        }
    },
});

