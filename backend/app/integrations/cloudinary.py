"""Cloudinary integration service abstraction.

This module defines the interface for Cloudinary media management.
Implementation will be added when media upload functionality is built.
"""


class CloudinaryService:
    """Service for managing media assets via Cloudinary."""

    def __init__(self, cloud_name: str, api_key: str, api_secret: str) -> None:
        self._cloud_name = cloud_name
        self._api_key = api_key
        self._api_secret = api_secret

    async def upload_image(self, file_path: str, folder: str = "prompts") -> dict:
        """Upload an image to Cloudinary.

        Args:
            file_path: Local path or URL of the image to upload.
            folder: Cloudinary folder to store the image in.

        Returns:
            Dictionary containing the upload result with url, public_id, etc.
        """
        raise NotImplementedError("Cloudinary integration not yet configured")

    async def delete_image(self, public_id: str) -> bool:
        """Delete an image from Cloudinary by its public ID.

        Args:
            public_id: The Cloudinary public ID of the image to delete.

        Returns:
            True if deletion was successful.
        """
        raise NotImplementedError("Cloudinary integration not yet configured")

    async def get_image_url(
        self, public_id: str, width: int | None = None, height: int | None = None
    ) -> str:
        """Generate a transformed image URL.

        Args:
            public_id: The Cloudinary public ID.
            width: Optional width for transformation.
            height: Optional height for transformation.

        Returns:
            The transformed image URL string.
        """
        raise NotImplementedError("Cloudinary integration not yet configured")
