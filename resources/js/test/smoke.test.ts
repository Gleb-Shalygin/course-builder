describe('vitest setup', () => {
    it('runs in happy-dom environment', () => {
        expect(document).toBeDefined();
    });
});
