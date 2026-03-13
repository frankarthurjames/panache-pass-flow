import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { SEO } from "../SEO";
import { HelmetProvider } from "react-helmet-async";

// Mock Helmet to see what it receives
vi.mock("react-helmet-async", async () => {
    const actual = await vi.importActual("react-helmet-async");
    return {
        ...actual,
        Helmet: ({ children }: { children: React.ReactNode }) => <div data-testid="helmet">{children}</div>,
    };
});

describe("SEO Component", () => {
    it("renders without crashing", () => {
        const { getByTestId } = render(
            <HelmetProvider>
                <SEO title="Test  Title" description="Test Description" />
            </HelmetProvider>
        );
        expect(getByTestId("helmet")).toBeDefined();
    });

    it("displays the correct title", () => {
        const { getByTestId } = render(
            <HelmetProvider>
                <SEO title="Test Title" />
            </HelmetProvider>
        );
        const helmet = getByTestId("helmet");
        expect(helmet.innerHTML).toContain("Test Title | Panache");
    });

    it("uses default description if none provided", () => {
        const { getByTestId } = render(
            <HelmetProvider>
                <SEO title="Test Title" />
            </HelmetProvider>
        );
        const helmet = getByTestId("helmet");
        expect(helmet.innerHTML).toContain("Panache - Réservez vos activités sportives");
    });
});
