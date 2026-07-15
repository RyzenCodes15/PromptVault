"""Cloudinary integration service."""

import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url


class CloudinaryService:
    """Service for managing media assets via Cloudinary."""

    def __init__(self, cloud_name: str, api_key: str, api_secret: str) -> None:
        self._cloud_name = cloud_name
        self._api_key = api_key
        self._api_secret = api_secret
        cloudinary.config(
            cloud_name=self._cloud_name,
            api_key=self._api_key,
            api_secret=self._api_secret,
            secure=True,
        )

    async def upload_image(self, file_path: str | bytes, folder: str = "prompts") -> dict:
        """Upload an image to Cloudinary.

        Args:
            file_path: Local path, URL, or bytes of the image to upload.
            folder: Cloudinary folder to store the image in.

        Returns:
            Dictionary containing the upload result with url, public_id, etc.
        """
        result = cloudinary.uploader.upload(file_path, folder=folder)
        return result

    async def delete_image(self, public_id: str) -> bool:
        """Delete an image from Cloudinary by its public ID.

        Args:
            public_id: The Cloudinary public ID of the image to delete.

        Returns:
            True if deletion was successful.
        """
        result = cloudinary.uploader.destroy(public_id)
        return result.get("result") == "ok"

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
        options = {}
        if width:
            options["width"] = width
        if height:
            options["height"] = height
            options["crop"] = "fill"
        
        url, _ = cloudinary_url(public_id, **options)
        return url
