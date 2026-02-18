const {
    createRequest,
    getRequests,
    getRequestById,
    updateRequest,
    deleteRequest,
} = require("../../../controllers/requestsController");

const Request = require("../../../models/requests");
jest.mock("../models/requests");

const mockRequest = () => ({ body: {}, params: {} });
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("Requests Controller Unit Tests", () => {
    let req, res;

    beforeEach(() => {
        req = mockRequest();
        res = mockResponse();
        jest.clearAllMocks();
    });

    // CREATE
    it("should create a request and return 201 status", async () => {
        const requestData = {
            userId: "user-id",
            communityId: "community-id",
            status: "pending",
        };
        req.body = requestData;

        Request.create.mockResolvedValueOnce({ ...requestData, _id: "fake-id" });

        await createRequest(req, res);

        expect(Request.create).toHaveBeenCalledTimes(1);
        expect(Request.create).toHaveBeenCalledWith(requestData);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Request created successfully",
            data: { ...requestData, _id: "fake-id" },
        });
    });

    it("should return 400 if validation fails on create", async () => {
        const mockError = new Error("Validation failed");
        mockError.name = "ValidationError";
        Request.create.mockRejectedValueOnce(mockError);

        await createRequest(req, res);

        expect(Request.create).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: "Validation failed",
            details: "Validation failed",
        });
    });

    // READ ALL
    it("should fetch all requests with 200 status", async () => {
        const mockRequests = [
            { _id: "1", userId: "user1", communityId: "comm1", status: "pending" },
            { _id: "2", userId: "user2", communityId: "comm2", status: "approved" },
        ];
        Request.find.mockResolvedValueOnce(mockRequests);

        await getRequests(req, res);

        expect(Request.find).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Requests fetched successfully",
            data: mockRequests,
        });
    });

    // READ ONE
    it("should fetch a request by ID", async () => {
        const mockRequestData = { _id: "1", userId: "user1", communityId: "comm1", status: "pending" };
        req.params.id = "1";
        Request.findById.mockResolvedValueOnce(mockRequestData);

        await getRequestById(req, res);

        expect(Request.findById).toHaveBeenCalledWith("1");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: mockRequestData,
        });
    });

    it("should return 404 if request not found by ID", async () => {
        req.params.id = "1";
        Request.findById.mockResolvedValueOnce(null);

        await getRequestById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: "Request not found",
        });
    });

    // UPDATE
    it("should update a request successfully", async () => {
        const updatedData = { status: "approved" };
        const updatedRequest = { _id: "1", userId: "user1", communityId: "comm1", ...updatedData };
        req.params.id = "1";
        req.body = updatedData;

        Request.findByIdAndUpdate.mockResolvedValueOnce(updatedRequest);

        await updateRequest(req, res);

        expect(Request.findByIdAndUpdate).toHaveBeenCalledWith(
            "1",
            updatedData,
            { new: true, runValidators: true }
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Request updated successfully",
            data: updatedRequest,
        });
    });

    it("should return 404 if request to update not found", async () => {
        req.params.id = "1";
        req.body = { status: "approved" };
        Request.findByIdAndUpdate.mockResolvedValueOnce(null);

        await updateRequest(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: "Request not found",
        });
    });

    // DELETE
    it("should delete a request successfully", async () => {
        const deletedRequest = { _id: "1", userId: "user1", communityId: "comm1" };
        req.params.id = "1";
        Request.findByIdAndDelete.mockResolvedValueOnce(deletedRequest);

        await deleteRequest(req, res);

        expect(Request.findByIdAndDelete).toHaveBeenCalledWith("1");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Request deleted successfully",
        });
    });

    it("should return 404 if request to delete not found", async () => {
        req.params.id = "1";
        Request.findByIdAndDelete.mockResolvedValueOnce(null);

        await deleteRequest(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: "Request not found",
        });
    });
});
