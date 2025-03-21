import { Auths } from './auth';
import { sendErr } from './sendError';
import { hasProperty, isSameDay } from './helperFunctions';
import { collectionFileUploader, collectionUploadFileUpload, companyFileUploader, fileHandler, groupUploadFileUpload, pageFileUploader, portfolioUploadFileUpload } from './filehandler';
import { axios } from './proxy'

export {
    Auths as Auths,
    sendErr as sendError,
    hasProperty as hasProperty,
    groupUploadFileUpload as groupUploadFileUpload,
    portfolioUploadFileUpload as portfolioUploadFileUpload,
    fileHandler as fileHandler,
    collectionUploadFileUpload as collectionUploadFileUpload,
    collectionFileUploader as collectionFileUploader,
    pageFileUploader as pageFileUploader,
    companyFileUploader as companyFileUploader,
    isSameDay as isSameDay,
    axios as axios
}