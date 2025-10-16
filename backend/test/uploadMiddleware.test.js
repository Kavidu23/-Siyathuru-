const MockCloudinaryStorage = jest.fn().mockImplementation(function () {
    this.name = 'MockCloudinaryStorage';
});

jest.mock("multer-storage-cloudinary", () => ({
    CloudinaryStorage: MockCloudinaryStorage,
}));

const MockMulter = jest.fn((options) => ({
    single: jest.fn(),
    array: jest.fn(),
    options,
}));
jest.mock("multer", () => MockMulter);

jest.mock("../config/cloudinary", () => ({
    v2: {
        config: jest.fn(),
    }
}));
const cloudinary = require("../config/cloudinary");

const upload = require("../middleware/upload");

describe("Upload Middleware Configuration", () => {
    it("should initialize CloudinaryStorage with the correct configuration", () => {
        expect(MockCloudinaryStorage).toHaveBeenCalledTimes(1);

        const constructorArgs = MockCloudinaryStorage.mock.calls[0][0];

        expect(constructorArgs.cloudinary).toBe(cloudinary);
        expect(constructorArgs.params).toBeDefined();
        expect(constructorArgs.params.folder).toBe("communities");
        expect(constructorArgs.params.allowed_formats).toEqual(["jpg", "jpeg", "png"]);
    });

    it("should initialize Multer with the created CloudinaryStorage instance", () => {
        expect(MockMulter).toHaveBeenCalledTimes(1);

        const multerOptions = MockMulter.mock.calls[0][0];

        expect(multerOptions.storage).toBeDefined();
        expect(multerOptions.storage.name).toBe("MockCloudinaryStorage");
    });

    it("should export a valid Multer middleware instance", () => {
        expect(upload).toBeDefined();
        expect(typeof upload.single).toBe("function");
        expect(typeof upload.array).toBe("function");
    });
});