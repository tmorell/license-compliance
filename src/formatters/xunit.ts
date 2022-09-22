import xmlbuilder from "xmlbuilder";

import { Formatter } from "./index";
import { Package } from "../interfaces";

interface LicenseDetail {
    name: string;
    packages: Array<Package>;
}

type XmlValue = string | number | boolean;
type RecursiveXmlValue = XmlValue | Record<string, XmlValue> | Array<Record<string, XmlValue>>;

interface XUnitTestCase extends Record<string, RecursiveXmlValue> {
    failure: Record<string, XmlValue>;
}

interface XUnitTestSuite extends Record<string, RecursiveXmlValue | Array<XUnitTestCase>> {
    testcase: Array<XUnitTestCase>;
}

interface XUnitTestSuites extends Record<string, RecursiveXmlValue | Array<XUnitTestSuite>> {
    testsuite: Array<XUnitTestSuite>;
}

/**
 * This formatter produces an XUnit compatible format used by some CI/CD engines such as Bitbucket Pipelines
 * @see https://support.atlassian.com/bitbucket-cloud/docs/test-reporting-in-pipelines/
 */
export class Xunit implements Formatter {
    private readonly TEST_SUITES_NAME = "License Compliance";
    private readonly TEST_CASE_ERROR_TYPE = "License Compliance Error";

    detail(packages: Array<Package>): void {
        const xmlContent = this.serializeObjectToXml({
            testsuites: this.formatDetailedTestSuites(packages),
        });

        console.info(xmlContent);
    }

    summary(licenses: Array<{ name: string; count: number }>): void {
        const xmlContent = this.serializeObjectToXml({
            testsuites: this.formatSummaryTestSuites(licenses),
        });

        console.info(xmlContent);
    }

    private formatDetailedTestSuites(packages: Array<Package>): XUnitTestSuites {
        const detailedList = this.groupPackagesByLicense(packages);
        const totalNumberOfFailures = detailedList.reduce((sum, license): number => sum + license.packages.length, 0);

        return {
            "@name": this.TEST_SUITES_NAME,
            "@tests": totalNumberOfFailures,
            "@errors": 0,
            "@failures": totalNumberOfFailures,
            testsuite: detailedList.map((license): XUnitTestSuite => ({
                "@name": license.name,
                "@tests": license.packages.length,
                "@errors": 0,
                "@failures": license.packages.length,
                testcase: license.packages.map((packageInformations): XUnitTestCase => ({
                    "@name": `${packageInformations.name}@${packageInformations.version}`,
                    "@path": packageInformations.path,
                    failure: {
                        "@type": this.TEST_CASE_ERROR_TYPE,
                        "#text": `Package "${packageInformations.name}@${packageInformations.version}" uses non compliant license "${packageInformations.license}"`,
                    },
                })),
            })),
        };
    }

    private formatSummaryTestSuites(licenses: Array<{ name: string; count: number }>): XUnitTestSuites {
        return {
            "@name": this.TEST_SUITES_NAME,
            "@tests": licenses.length,
            "@errors": 0,
            "@failures": licenses.length,
            testsuite: licenses.map((license): XUnitTestSuite => ({
                "@name": license.name,
                "@tests": 1,
                "@errors": 0,
                "@failures": 1,
                testcase: [{
                    "@name": license.name,
                    failure: {
                        "@type": this.TEST_CASE_ERROR_TYPE,
                        "#text": `${license.count} package${license.count > 1 ? "s" : ""} use non compliant license "${license.name}"`,
                    },
                }],
            })),
        };
    }

    /**
     * Loop through a list of packages and group them by license name
     */
    private groupPackagesByLicense(packages: Array<Package>): Array<LicenseDetail> {
        return packages.reduce<Array<LicenseDetail>>(
            (licenses, packageInformations): Array<LicenseDetail> => {
                const licenseIndex = licenses.findIndex((license): boolean => license.name === packageInformations.license);

                if (licenseIndex >= 0) {
                    // if the license was already in the iterator, push the current package to its list
                    licenses[licenseIndex].packages.push(packageInformations);
                } else {
                    // otherwise add an item with the license name
                    licenses.push({
                        name: packageInformations.license,
                        packages: [packageInformations],
                    });
                }

                return licenses;
            },
            [],
        );
    }

    private serializeObjectToXml(object: Record<string, RecursiveXmlValue | XUnitTestSuites>): string {
        return xmlbuilder
            .create(object, {
                stringify: {
                    attEscape: this.escapeString,
                    textEscape: this.escapeString,
                },
            })
            .dec("1.0", "UTF-8")
            .end({
                pretty: true,
            });
    }

    private escapeString(text: string): string {
        return text
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }
}
